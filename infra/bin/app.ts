// this file is the entry point for the CDK application
// it is used to define and deploy the infrastructure and to tell which stacks exist

import * as cdk from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack.js';
import { SiteStack } from '../lib/site-stack.js';

const app = new cdk.App();

// Values come from the "context" block in cdk.json.
const domainName = app.node.tryGetContext('domainName') as string;
// "repo:owner@ownerId/repo@repoId" — GitHub's immutable OIDC subject prefix,
// read with: gh api repos/OWNER/REPO/actions/oidc/customization/sub
const githubSubjectPrefix = app.node.tryGetContext('githubSubjectPrefix') as string;
const githubBranch = (app.node.tryGetContext('githubBranch') as string) || 'main';
// Only one GitHub OIDC provider can exist per AWS account. If this account
// already has one, put its ARN here and CDK will reuse it instead of failing.
const existingOidcProviderArn = app.node.tryGetContext('existingOidcProviderArn') as string | undefined;

if (!domainName) throw new Error('Set "domainName" in infra/cdk.json');
if (!githubSubjectPrefix?.startsWith('repo:'))
  throw new Error('Set "githubSubjectPrefix" in infra/cdk.json');

// CloudFront can only use certificates issued in us-east-1, so the stacks that
// own the certificate and the distribution live there. Everything else here is
// either global (CloudFront, IAM, Route 53) or trivially cheap to host in
// us-east-1 (the bucket), and keeping one region avoids cross-region plumbing.
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

// Deploy this one first, then point the registrar at the nameservers it prints.
const dns = new DnsStack(app, 'QuickCareDns', { domainName, env });

// Then this one. Its certificate cannot validate until the delegation above
// has taken effect.
new SiteStack(app, 'QuickCareSite', {
  domainName,
  hostedZone: dns.hostedZone, // passing an object from the previous stack, CDK will link them automatically and save us from having to do it manually in the AWS Console
  githubSubjectPrefix,
  githubBranch,
  existingOidcProviderArn,
  env,
});
