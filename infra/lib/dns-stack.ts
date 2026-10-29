import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface DnsStackProps extends cdk.StackProps {
  /** Apex domain, e.g. "quickcare.lk". */
  domainName: string;
}

/**
 * The DNS zone, on its own and deployed first.
 *
 * Why it is a separate stack: the certificate in SiteStack is validated by
 * DNS, and AWS can only confirm that validation once this zone is actually
 * authoritative for the domain. That means the nameservers below have to be
 * registered with the .lk registrar BEFORE SiteStack is deployed. Keeping the
 * zone separate gives you a deploy that finishes in seconds and prints the
 * nameservers, instead of one that sits waiting for a certificate that can
 * never validate.
 */
export class DnsStack extends cdk.Stack {
  readonly hostedZone: route53.PublicHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    this.hostedZone = new route53.PublicHostedZone(this, 'HostedZone', {
      zoneName: props.domainName,
      comment: 'Quick Care Elders Home',
    });

    // Deleting the zone would hand the domain's DNS back to nobody, and a new
    // zone gets different nameservers, so this one is kept on `cdk destroy`.
    this.hostedZone.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);

    new cdk.CfnOutput(this, 'HostedZoneId', { value: this.hostedZone.hostedZoneId });
    new cdk.CfnOutput(this, 'Nameservers', {
      description: 'Set these as the nameservers for the domain at your .lk registrar',
      value: cdk.Fn.join(', ', this.hostedZone.hostedZoneNameServers ?? []),
    });
  }
}
