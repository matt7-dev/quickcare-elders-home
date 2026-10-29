# Project Brief: Quick Care Elders Home — Astro Website

## Business Details

- **Name**: Quick Care Elders Home
- **Type**: Elder care / nursing home
- **Address**: 6/6, St. Peter's Lane 2, Moratuwella, Moratuwa 10400, Sri Lanka
- **Phone / WhatsApp**: 077 590 0013
- **Facebook**: facebook.com/share/1KPRjoFpQN/
- **Hours**: Open 24 hours
- **Category**: Nursing home / Elderly residential care

## Design Direction

Modern, warm, trustworthy — not clinical/cold, not childish. Soft neutral palette
with one warm accent color (terracotta, warm blue, or sage). Generous whitespace,
large readable type (audience skews 35–60, often browsing on mobile). Subtle
scroll-triggered fade/slide-ins, a gentle parallax or image-reveal on the hero —
tasteful, not flashy. Use real facility photos, not generic elderly-care stock
imagery.

## Pages / Sections

Single-page scroll (or multi-page if better for SEO — use judgment):

1. **Hero** — strong facility photo, headline ("A Safe, Caring Home for Your
   Loved Ones in Moratuwa"), subhead, Call + WhatsApp CTA buttons
2. **About / Our Promise** — short warm paragraph on philosophy of care,
   dignity, family-like environment
3. **Services** — Residential Care, 24-Hour Supervision, Nutritious Meals,
   Medication Assistance, Nursing Care, Personal Hygiene Support
   (icon + short description each)
4. **Facilities / Gallery** — photo grid of rooms, common areas, bathrooms
   (masonry or lightbox gallery)
5. **Why Choose Us** — 3–4 trust points (24-hour staff, clean modern
   facilities, personalized care, central Moratuwa location)
6. **Testimonials** — placeholder structure for 3 reviews, swap in real
   ones once collected
7. **Visit Us / Contact** — embedded Google Map, address, phone, hours,
   simple contact form (optional)
8. **Sticky mobile CTA bar** — persistent Call + WhatsApp buttons on
   scroll (mobile especially — this is the #1 conversion driver)

## SEO Requirements

- Target keywords: "elders home Moratuwa," "elderly care Moratuwa,"
  "nursing home Moratuwa," "senior care Colombo," "elder care facility
  Sri Lanka"
- `<title>`: "Quick Care Elders Home | Elderly Care & Nursing Home in
  Moratuwa"
- Meta description (~155 chars): "Quick Care Elders Home offers safe,
  dignified residential care for seniors in Moratuwa, Sri Lanka. Private
  rooms, 24-hour care. Call 077 590 0013."
- Open Graph + Twitter Card tags (hero photo as og:image)
- JSON-LD structured data, type `NursingHome` (schema.org) — name,
  address, telephone, openingHours, geo coordinates, image
- Semantic HTML (proper h1/h2 hierarchy), meaningful alt text on every
  image
- `sitemap.xml` and `robots.txt` (use Astro's official sitemap
  integration)
- Canonical URL tag
- Optimize Core Web Vitals — use Astro's `<Image />` component, WebP
  format

## Mobile Responsiveness

- Mobile-first breakpoints
- Sticky call/WhatsApp bar only on mobile (hide on desktop, use header
  buttons instead)
- Touch-friendly tap targets (min 44px)
- Gallery/lightbox tested on touch

## Technical Stack

- Astro + Tailwind CSS
- Static output (`output: 'static'`)
- Deploy target: AWS S3 + CloudFront
- Contact form (if included): AWS Lambda + SES, or a form service like
  Formspree if no backend is wanted

## Deployment Pipeline (Infrastructure as Code)

This is a portfolio piece, so set up proper IaC rather than manual
console uploads:

- GitHub Actions workflow that builds the Astro site and syncs to S3
  on push to `main`
- CloudFront invalidation step after each deploy
- Either Terraform/CDK for the S3 bucket + CloudFront distribution +
  Route 53 + ACM certificate setup, OR a well-commented `deploy.sh`
  using AWS CLI if IaC tooling feels like overkill for this project —
  ask which the user prefers before picking
- README documenting the architecture and deployment process (useful
  for the portfolio)

## WhatsApp Link Format

`https://wa.me/94775900013?text=Hi,%20I'd%20like%20to%20inquire%20about%20Quick%20Care%20Elders%20Home`
