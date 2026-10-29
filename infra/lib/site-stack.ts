import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SiteStackProps extends cdk.StackProps {
  /** Apex domain, e.g. "quickcare.lk". */
  domainName: string;
  /** The zone created by DnsStack, already delegated at the registrar. */
  hostedZone: route53.IHostedZone;
  /** "owner/repo" allowed to deploy via GitHub Actions OIDC. */
  githubRepo: string;
  /** Branch allowed to deploy. */
  githubBranch: string;
  /** Only one GitHub OIDC provider may exist per AWS account; pass an existing one's ARN to reuse it. */
  existingOidcProviderArn?: string;
}

export class SiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    const { domainName, hostedZone } = props;
    const wwwName = `www.${domainName}`;

    // --- Storage ---------------------------------------------------------
    // The bucket is completely private: no public access, no website hosting
    // endpoint. CloudFront is the only thing allowed to read it, which is set
    // up by the Origin Access Control further down. That means there is no
    // way to reach an object except through the CDN, so the cache, the HTTPS
    // redirect and the security headers can never be bypassed.
    const bucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // Safe to destroy: every object is a build artefact reproducible from
      // git. Nothing here is a source of truth.
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // --- Certificate -----------------------------------------------------
    // CloudFront only reads certificates from us-east-1, so this whole stack
    // is pinned there (see bin/app.ts). Validation is by DNS: ACM asks for a
    // CNAME, CDK writes it into the hosted zone automatically, and AWS checks
    // it. This is the step that hangs if the domain's nameservers do not yet
    // point at the zone DnsStack created.
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [wwwName],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // --- CDN -------------------------------------------------------------
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'Quick Care Elders Home',
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      // Sri Lankan visitors are served from the nearest Asian edge.
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      domainNames: [domainName, wwwName],
      certificate,
      defaultBehavior: {
        // withOriginAccessControl signs CloudFront's requests to S3 and adds
        // the matching bucket policy, so the bucket can stay private.
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      // A private bucket answers a missing key with 403, not 404, so both map
      // to the site's own 404 page.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: cdk.Duration.minutes(5),
      })),
    });

    // --- DNS records -----------------------------------------------------
    // ALIAS records, not CNAME. A CNAME cannot legally sit on an apex domain,
    // and an ALIAS resolves to CloudFront's current addresses at query time
    // with no extra lookup for the visitor. A and AAAA so the site answers
    // over both IPv4 and IPv6.
    const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
    for (const [id, recordName] of [
      ['Apex', domainName],
      ['Www', wwwName],
    ]) {
      new route53.ARecord(this, `${id}A`, { zone: hostedZone, recordName, target });
      new route53.AaaaRecord(this, `${id}Aaaa`, { zone: hostedZone, recordName, target });
    }

    // --- CI/CD identity --------------------------------------------------
    // GitHub Actions proves who it is with a short-lived OIDC token instead of
    // an AWS access key. Registering GitHub as an identity provider tells AWS
    // to trust tokens it signed; the role's trust policy below then decides
    // which of those tokens may assume it. No long-lived credential exists
    // anywhere, so there is nothing to leak or rotate.
    const providerArn =
      props.existingOidcProviderArn ??
      new iam.OpenIdConnectProvider(this, 'GithubOidc', {
        url: 'https://token.actions.githubusercontent.com',
        clientIds: ['sts.amazonaws.com'],
      }).openIdConnectProviderArn;

    const deployRole = new iam.Role(this, 'GithubDeployRole', {
      description: 'Assumed by GitHub Actions to upload the site and invalidate CloudFront',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(providerArn, {
        // StringEquals, not StringLike: an exact match on the full subject.
        // A wildcard such as repo:owner/*:* would let any repository in the
        // account assume this role, and `ref:refs/heads/main` additionally
        // rules out pull requests, tags and every other branch.
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          'token.actions.githubusercontent.com:sub': `repo:${props.githubRepo}:ref:refs/heads/${props.githubBranch}`,
        },
      }),
    });

    // Least privilege: this role can write the site's objects and invalidate
    // this one distribution. It cannot read another bucket, touch DNS, or
    // change any infrastructure.
    bucket.grantReadWrite(deployRole);
    bucket.grantDelete(deployRole);
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        // CreateInvalidation to purge the cache; GetInvalidation so the
        // workflow can wait for that purge to finish before it reports success.
        actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'],
        resources: [
          this.formatArn({
            service: 'cloudfront',
            region: '', // CloudFront is a global service: its ARNs carry no region
            resource: 'distribution',
            resourceName: distribution.distributionId,
          }),
        ],
      }),
    );

    // --- Outputs ---------------------------------------------------------
    // Copy these into GitHub repository Variables. None is a secret: the role
    // is useless without a GitHub OIDC token whose subject matches exactly.
    new cdk.CfnOutput(this, 'AwsDeployRoleArn', { value: deployRole.roleArn });
    new cdk.CfnOutput(this, 'S3Bucket', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'CloudfrontDistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${domainName}` });
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      description: 'Direct CloudFront URL, useful for testing before DNS resolves',
      value: distribution.distributionDomainName,
    });
  }
}
