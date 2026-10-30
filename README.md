# Quick Care Elders Home

Marketing website for Quick Care Elders Home, a nursing home in Moratuwa, Sri Lanka.
Built with **Astro** + **Tailwind CSS**, deployed to **AWS S3 + CloudFront** with
infrastructure defined in **AWS CDK (TypeScript)** and shipped by **GitHub Actions**.

## Architecture

```
git push main
     │
     ▼
GitHub Actions ── OIDC (no stored AWS keys) ──► IAM role (least privilege)
     │ npm run build                                   │
     ▼                                                 ▼
   dist/ ──── aws s3 sync ───────────────►  S3 bucket (private)
                                                       ▲ Origin Access Control
 Visitor ──► CloudFront (HTTPS, HTTP/3, gzip/brotli) ──┘
                │
                └─ Route 53 ALIAS records (A + AAAA) + ACM certificate
```

- **S3** is private; only CloudFront can read it (OAC).
- **CloudFront** redirects to HTTPS, adds security headers, serves `404.html` for missing paths.
- **Deploys** happen on every push to `main`: build, sync (hashed assets cached for a year, HTML
  revalidated), then invalidate the CDN.
- **Infrastructure** changes are deployed separately with `cdk deploy`, so CI never holds
  infrastructure-level permissions. Its role can only write to the one bucket and invalidate the one
  distribution, and only the `main` branch of this repository can assume it.

Estimated running cost for a site this size: **about $0.50–1.00/month** — the Route 53 hosted zone
is $0.50, and S3 storage plus CloudFront traffic fall inside the perpetual free tier (1 TB out and
10 million requests a month). The `.lk` domain is billed separately by the registrar.

## Local development

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # production build into dist/
npm run preview        # serve dist/ locally
```

### Content

| What | Where |
|---|---|
| Business details, services, trust points, testimonials | `src/config/site.ts` |
| Photos | `src/assets/images/` (`hero.jpg`, `gallery-<label>-<n>.jpg`) |
| Colours and fonts | `src/styles/global.css` |
| Page sections | `src/components/` |

Testimonials marked `placeholder: true` only show in `npm run dev`. Set real reviews with
`placeholder: false` and the section appears in production.

## Analytics

Google Analytics 4, property `G-SNEP7DS7QL`, wired in `src/components/Analytics.astro`.

The measurement ID lives in `src/config/site.ts` rather than in an environment variable. It is
public by design — it ships in the page source of every GA-tracked site — so it is configuration,
not a secret, and keeping it in the repository means a deploy can never silently lose its analytics.

**The tag only renders in production builds.** The component checks `import.meta.env.PROD`, which
Astro sets to `false` under `npm run dev` and `true` under `npm run build`. So local development is
never counted, and no flag has to be remembered.

### What GA reports on its own

Enhanced measurement is enabled on the stream, which covers page views, scroll depth, outbound
clicks, and where visitors came from (Google, Facebook, direct).

### The one custom event

GA cannot see a `tel:` tap — and a phone call is the whole point of this site. So the page sends its
own `contact_click` event with two parameters:

- `method` — `phone`, `whatsapp`, `directions` or `facebook`
- `area` — `header`, `hero`, `contact`, `sticky-bar` or `footer`

That second one answers the question worth asking: do calls come from the hero, or from the bar
fixed to the bottom of a phone screen?

One listener on `document` handles every link on the page, matching on the `href`. Sections are
labelled with a `data-ga-area` attribute, and the listener walks up from the clicked link to find
the nearest one.

### Finishing the GA setup

1. **Register the parameters as dimensions.** Admin → Custom definitions → Create custom dimension,
   scope **Event**, once for `method` and once for `area`. GA only collects dimension data from the
   moment you create them, so do this before you need it — it cannot backfill.
2. **Mark the event as a key event.** Admin → Events → `contact_click` → *Mark as key event*, so
   inquiries are counted as conversions.
3. **Filter yourself out.** Admin → Data streams → the stream → Configure tag settings → Define
   internal traffic, with your own IP. Otherwise your own visits inflate a small site's numbers.

| Question | Where to look |
|---|---|
| Where visitors come from | Reports → Acquisition → Traffic acquisition |
| Which sections hold attention | Reports → Engagement → Pages and screens |
| Phone, WhatsApp, directions and Facebook taps | Reports → Engagement → Events → `contact_click` |
| Phone vs desktop, and which city | Reports → User → Tech / Demographics |

### Privacy

GA4 does not store full IP addresses and the site sets no cookies of its own. Sri Lanka has no
cookie-consent law of the kind the EU has, so no banner is required. If the home ever markets to
families in the EU or UK, a consent banner gating the tag would become necessary.

## Deployment

Two separate things are deployed, and keeping them separate is the point:

| | What it creates | How often it runs | Run by |
|---|---|---|---|
| **Infrastructure** (`cdk deploy`) | Bucket, CDN, DNS, certificate, the CI role | Rarely — only when the architecture changes | You, from your laptop |
| **Content** (GitHub Actions) | The built HTML, CSS, images in the bucket | Every push to `main` | Automatically |

CI never holds permission to change infrastructure. The worst a bad commit can do is publish a bad
page; it cannot delete a distribution or open the bucket to the world.

### Prerequisites

1. **An AWS account**, with the CLI installed and signed in (`aws configure sso`, or
   `aws configure` with an admin key). Check it works: `aws sts get-caller-identity`.
2. **The domain `quickcare.lk` registered.** AWS cannot sell `.lk` domains, so this is bought from
   a Sri Lankan registrar under the LK Domain Registry (`nic.lk`). You only need the domain — the
   registrar's own DNS hosting is not used, because Route 53 takes that over in step 2 below.
3. **Node 24** and the repository cloned.

### Step 1 — Create the GitHub repository

The IAM trust policy is pinned to the exact repository name, so this comes first.

```bash
gh repo create quickcare-elders-home --public --source=. --remote=origin --push
```

If you choose a different name, change `githubRepo` in `infra/cdk.json` to match before deploying.
The name is currently set to `matt7-dev/quickcare-elders-home`.

### Step 2 — Deploy DNS and delegate the domain

```bash
cd infra
npm install
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1   # once per account+region, ever
npx cdk deploy QuickCareDns
```

Bootstrapping creates a small staging bucket and roles that CDK needs to deploy anything at all.

`QuickCareDns` creates a Route 53 **hosted zone** — the authoritative record of what `quickcare.lk`
points to — and prints four nameservers:

```
QuickCareDns.Nameservers = ns-1234.awsdns-56.org, ns-789.awsdns-01.net, ...
```

**Now go to your `.lk` registrar and set those four as the domain's nameservers.** This is the step
that hands DNS control to AWS. Until it is done and has propagated, nothing else will work.

Check it has taken effect (it can take 15 minutes to a few hours):

```bash
dig +short NS quickcare.lk
```

Only move on once that lists the AWS nameservers.

### Step 3 — Deploy the site infrastructure

```bash
npx cdk deploy QuickCareSite
```

This creates the bucket, the certificate, the CDN, the DNS records and the CI role.

It will pause for several minutes at the certificate. ACM is asking Route 53 to prove you control
the domain: CDK writes a validation record into the zone automatically, and AWS checks for it. **If
step 2's delegation has not gone through, this is where it hangs** — there is nothing to wait for,
because AWS is querying nameservers that are not yours yet. Cancel, fix the delegation, redeploy.

When it finishes it prints the three values CI needs:

```
QuickCareSite.AwsDeployRoleArn          = arn:aws:iam::123456789012:role/QuickCareSite-...
QuickCareSite.S3Bucket                  = quickcaresite-sitebucket-...
QuickCareSite.CloudfrontDistributionId  = E1A2B3C4D5E6F7
```

### Step 4 — Give GitHub those values

GitHub → **Settings** → **Secrets and variables** → **Actions** → **Variables** tab →
**New repository variable**, four times:

| Variable | Value |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | the `AwsDeployRoleArn` output |
| `S3_BUCKET` | the `S3Bucket` output |
| `CLOUDFRONT_DISTRIBUTION_ID` | the `CloudfrontDistributionId` output |
| `SITE_URL` | `https://quickcare.lk` |

**Variables, not Secrets.** None of these is sensitive. The role ARN is the interesting one: knowing
it buys an attacker nothing, because the role can only be assumed by presenting a token GitHub
signed whose subject is exactly `repo:matt7-dev/quickcare-elders-home:ref:refs/heads/main`.
Only GitHub can mint that token, and only for this repository on this branch. Using Secrets here
would just make the values harder to read in logs for no security gain.

### Step 5 — Deploy

```bash
git push origin main
```

Watch it in the Actions tab. The job finishes only once the CDN invalidation has completed, so when
it goes green the live site really is the new build.

## How the pieces fit

### Why the bucket is private

The obvious way to host a static site on S3 is to switch on "static website hosting" and make the
bucket public. This site does not do that. The bucket blocks all public access, and CloudFront
reaches it using **Origin Access Control** — CloudFront signs each request to S3 with its own
identity, and the bucket policy accepts only that signature.

The reason is that a public bucket can be fetched directly, bypassing the CDN, which means
bypassing HTTPS, the security headers and the cache. With OAC there is exactly one route in.

### Why OIDC instead of an access key

The old way to let CI into AWS was to create an IAM user, generate an access key, and paste it into
GitHub Secrets. That key is long-lived: it works until someone remembers to rotate it, and if it
leaks in a log it is valid immediately from anywhere.

OIDC replaces it with a conversation:

1. The workflow asks GitHub for a token describing itself. That is what `id-token: write` permits.
2. The token says, signed by GitHub: *this is repo `matt7-dev/quickcare-elders-home`, branch
   `main`.*
3. The workflow hands it to AWS, which verifies GitHub's signature against the OpenID Connect
   provider registered in the account.
4. AWS checks the token's claims against the role's trust policy, and if they match, issues
   credentials that expire in an hour.

Nothing durable is stored anywhere. The trust policy uses `StringEquals` on the full subject, not
`StringLike` with a wildcard — `repo:matt7-dev/*:*` would let *any* repository of yours
deploy, and without the `ref:refs/heads/main` part, a pull request from a fork could too.

### Why ALIAS records, not CNAME

CloudFront gives you a hostname (`d111111abcdef8.cloudfront.net`), not a fixed IP. Normally you
point at a hostname with a CNAME — but the DNS specification forbids a CNAME on an apex domain like
`quickcare.lk`, because the apex must also hold its own NS and SOA records.

Route 53's ALIAS is an AWS extension that solves this: it looks like an A record to the outside
world but resolves to CloudFront's current addresses at query time. It is also free to query, where
a CNAME costs a lookup. Both `A` (IPv4) and `AAAA` (IPv6) records exist for the apex and for `www`.

### Why the certificate must be in us-east-1

CloudFront is a global service, and it only reads ACM certificates from `us-east-1`, whatever region
the rest of your infrastructure uses. This project sidesteps the complication by putting everything
in `us-east-1`. The bucket's region barely matters here: CloudFront caches at the edge, so Sri
Lankan visitors are served from a nearby edge location and only a cache miss reaches the origin.

### Why the two-phase upload

Look at the two `s3 sync` steps in `.github/workflows/deploy.yml`. Files under `/_astro` have a
content hash in the filename, so they are uploaded first and cached for a year — a new build makes
new filenames, so a cached copy can never be stale. Everything else (HTML, sitemap, images) is
uploaded second with `--delete` and a no-cache header, so pages are always fresh and deleted pages
really disappear.

`/_astro` is excluded from the `--delete` sweep deliberately: a visitor who loaded the old HTML a
moment ago still needs the old stylesheet to exist.

### Useful commands

```bash
cd infra
npx cdk diff QuickCareSite    # what would change, before changing it
npx cdk synth QuickCareSite   # print the generated CloudFormation
npx cdk deploy QuickCareSite  # apply
npx cdk destroy QuickCareSite # tear down (the DNS zone is retained on purpose)
```

The hosted zone has `RemovalPolicy.RETAIN`: deleting and recreating it would issue different
nameservers and you would have to update the registrar again.
