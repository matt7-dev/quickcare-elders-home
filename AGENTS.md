## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project facts

Real business: Quick Care Elders Home, an elder care home in Moratuwella, Moratuwa, Sri Lanka.
Live at **quickcare.lk**. Also serves as a portfolio piece, so infrastructure should stay clean and
documented, not merely functional.

- `PRODUCT.md` holds the durable product context (users, positioning, constraints, design
  direction, accessibility bar). Read it before design or copy work.
- Business facts live once, in `src/config/site.ts`, and feed both the UI and the JSON-LD.
- Colour and type tokens live once, in `src/styles/global.css`. The company colour is `#053966`.
- `README.md` documents the architecture, analytics and deployment in full.

## Infrastructure

Decided and in place; do not substitute alternatives:

- **AWS CDK (TypeScript)** for infrastructure, in `infra/`. Not Terraform, not console clicking.
- **GitHub Actions** for CI/CD. Not CodePipeline or CodeBuild.
- **S3 (private) + CloudFront (Origin Access Control) + Route 53 + ACM.** The bucket is never
  public; the certificate lives in `us-east-1` because CloudFront reads certificates only from
  there, so the whole stack is pinned to that region.
- **GitHub OIDC federation**, never stored AWS access keys. The deploy role's trust policy uses
  `StringEquals` on the exact `sub` (`repo:OWNER/REPO:ref:refs/heads/main`) — never `StringLike`
  with wildcards — and grants only S3 read/write/delete on the site bucket plus
  `cloudfront:CreateInvalidation` and `GetInvalidation` on the one distribution.
- Route 53 gets **ALIAS** records (A and AAAA, apex and www), never CNAME.
- Two stacks: `QuickCareDns` must be deployed and its nameservers delegated at the `.lk` registrar
  before `QuickCareSite`, or certificate validation cannot complete.
- Stack outputs go into GitHub Actions repository **Variables**, not Secrets — none is sensitive
  given how tightly the trust policy is scoped.
- CI ships content only. Infrastructure changes go through `cdk deploy` from a workstation.

## Analytics

Google Analytics 4, `G-SNEP7DS7QL`, in `src/components/Analytics.astro`. The ID sits in
`src/config/site.ts` because it is public by design. The tag renders only when
`import.meta.env.PROD` is true, so `astro dev` never reports. One custom event, `contact_click`,
carries `method` and `area`, because GA cannot observe a `tel:` tap.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
