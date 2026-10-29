# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary visitor: an adult child of a prospective resident, roughly 35–60 years old, researching elder
care options on a phone. They are usually deciding where to place a parent or relative, often under
time pressure and emotional stress, and need to judge trustworthiness quickly before committing to a
call, a WhatsApp message, or an in-person visit. The elderly person themselves is not the primary
visitor to this site.

## Product Purpose

Marketing/informational site for Quick Care Elders Home, a nursing home in Moratuwa, Sri Lanka. The
site exists to generate inquiries from families choosing elder care. Success is a phone call, a
WhatsApp message, or a visit arranged — not form fills or newsletter signups (no contact form is
implemented; see Capabilities and Constraints).

## Positioning

No confirmed unique mechanism beyond the facility's general trust points. The business has not
identified a differentiator a nearby competitor couldn't also truthfully claim. Positioning currently
rests on generic, honest trust points only: 24-hour on-site staff, clean/modern facilities, personalized
care, and a central Moratuwa location. Do not invent a sharper claim than this.

## Operating Context

A family searches online, often on a phone, while deciding on care for a relative. The decision
culminates in a phone call, a WhatsApp message, or an in-person visit to the facility. The facility
itself operates 24 hours a day. The business is reachable by phone, WhatsApp, Facebook, and a physical
address shown on an embedded Google Map.

## Capabilities and Constraints

- Static site: Astro + Tailwind CSS, deployed to AWS S3 + CloudFront (see README.md for the pipeline).
- Business facts (name, address, phone, WhatsApp link, hours, geo, services, trust points,
  testimonials) are centralized in `src/config/site.ts` as the single source of truth, also used for
  JSON-LD structured data.
- No contact form is implemented. The Contact section offers an embedded map, address with
  directions link, phone/WhatsApp buttons, and a Facebook link only.
- Testimonials are real and ship in production: a resident (Mrs. Shirani Perera), a family member
  (Premith Mendis, from a Google review) and a caregiver (Ms. Tharaka Medis), each with their own
  photograph in `src/assets/images/person-*.jpg`. Long reviews are trimmed with an ellipsis and never
  reworded. The `placeholder: true` mechanism remains for any future entry: such entries render only
  in `npm run dev`.
- The geo coordinates in `site.ts` were supplied by the business (2026-10-28) and everything
  map-related derives from them. The Google Business Profile's own pin still sits on the wrong
  building; correcting it there is outstanding work on the business's side, not the site's.
- Google Analytics 4 is wired in `src/components/Analytics.astro`. The measurement ID comes from the
  build-time variable `PUBLIC_GA_ID`; with no value set no tag is injected, so development traffic
  never reaches the property. Beyond GA's automatic measurement the site sends one custom event,
  `contact_click`, with `method` and `area` parameters, because a `tel:` tap — the site's most
  valuable action — is invisible to enhanced measurement. See README.md.
- Content is currently English-only. Sinhala and/or Tamil support is a known future need, confirmed
  by the business, but is not yet built — no i18n structure exists today. Don't assume English-only
  is permanent when making structural decisions.

## Brand Commitments

- Name: Quick Care Elders Home.
- Voice: warm, trustworthy, dignified — explicitly not clinical/cold and not childish
  (PROJECT_BRIEF.md design direction).
- Real facility photography only, never generic elderly-care stock imagery — an explicit brief
  constraint, not a default preference.
- The company colour is #053966, a deep blue; it is the blue on the home's own signboard, visible in
  the hero photograph. It is the page's single accent and its dark ground, set as `--color-accent`
  in `src/styles/global.css`. The palette around it: a barely-warm white page ground (#f9f9f7) with
  soft sand panels (#e6ded1) carrying the warmth, and text set in the company blue taken down to
  reading weight (#0e2c4e) rather than in black — a neutral near-black reads as a smudge on warm
  paper and a cool grey-black reads clinical, which the brief rules out. Keep the page ground this
  close to neutral: a warmer one measures as the generic "yellow cream" ground whatever its
  provenance (verified by probe, 2026-10-29).

## Design Direction

Tone: calm, warm, reassuring. Explicitly not "bold," "award-level,"
or "distinct" in the design-gallery sense — this is a trust surface,
not a brand showcase. If using impeccable modes, treat this landing
page as Operate, not Persuade, despite being marketing-facing:
scanability and reassurance over visual ambition.

Motion: minimal and purposeful only — scroll reveals, hover states,
the sticky mobile CTA transition. Do not chase a minimum animated-
element count from any design-taste tooling; fewer, calmer
animations are correct here.

Visual language: flat color, real photography, generous whitespace.
No glassmorphism, no backdrop-blur panels, no floating pill nav.

## Evidence on Hand

- Real facility photos in `src/assets/images/`: hero, common room, dining area, garden, caregivers,
  private room, reception, twin room, daily activities.
- Verified business facts in `src/config/site.ts`: address, phone, WhatsApp link, Facebook page,
  hours (24 hours).
- Three real testimonials with portraits, given by the people named (collected 2026-10-28). Quotes may
  be shortened with an ellipsis but never reworded, and future work must not fabricate quotes, review
  counts, or ratings. Ms. Tharaka Medis also gave her review in Sinhala; that original is held for
  when Sinhala/Tamil support is built.
- Each resident has a call bell at the bedside; ringing it alerts the caregivers, who come to the
  room to check on them (confirmed by the business, 2026-10-29). Stated once, in the 24-Hour
  Supervision service under Health and safety.
- No published pricing, bed/room capacity, staff credentials, or licensing information on hand; don't
  invent these if asked to add trust content.

## Product Principles

1. Every inquiry path (call, WhatsApp, directions) must stay fast and frictionless for a mobile
   visitor who is likely under emotional pressure.
2. Trust is built from real evidence — real photos, honest facility details — not generic reassurance
   or stock imagery.
3. Business facts live once, in `src/config/site.ts`; copy and structured data must never drift from
   it or duplicate it elsewhere.
4. English is the language of record today; Sinhala/Tamil is a confirmed future direction, so avoid
   decisions that would make later i18n harder than necessary.
5. Positioning rests on generic, true trust points, not an invented differentiator — don't sharpen the
   claim beyond what the business has confirmed.

## Accessibility & Inclusion

No formal WCAG level is set as a requirement, but treat this as the
working bar: body text no smaller than 18-20px (do not default to a
16px floor), tap targets at 44px minimum, prefers-reduced-motion
respected as the default experience, not an edge case. This is a
trust surface for users under emotional pressure, often with lower
vision or motor precision in the room even if not the browsing
visitor themselves.
