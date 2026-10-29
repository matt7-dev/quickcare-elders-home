// Single source of truth for business details, used by the UI and JSON-LD.

const phoneLocal = '076 102 6363';
const phoneIntl = '+94761026363';
const whatsappMessage = "Hi, I'd like to inquire about Quick Care Elders Home";

// The exact building, read off Google Maps satellite view. Everything to do
// with the map derives from this, so the pin, the directions link and the
// structured data can never disagree.
const geo = { latitude: 6.7650018, longitude: 79.8846502 };
const geoQuery = `${geo.latitude},${geo.longitude}`;

export const site = {
  name: 'Quick Care Elders Home',
  title: 'Quick Care Elders Home | Elderly Care & Nursing Home in Moratuwa',
  description:
    'Quick Care Elders Home offers safe, dignified residential care for seniors in Moratuwa, Sri Lanka. Private rooms, 24-hour care. Call 076 102 6363.',
  keywords:
    'elders home Moratuwa, elderly care Moratuwa, nursing home Moratuwa, senior care Colombo, elder care facility Sri Lanka',
  phoneLocal,
  phoneIntl,
  phoneHref: `tel:${phoneIntl}`,
  // Derived from phoneIntl so the two can never drift apart.
  whatsappHref: `https://wa.me/${phoneIntl.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`,
  facebook: 'https://facebook.com/share/1KPRjoFpQN/',
  // Google Analytics 4 measurement ID. Public by design — it ships in the page
  // source of every GA-tracked site — so it is configuration, not a secret.
  ga4MeasurementId: 'G-SNEP7DS7QL',
  hours: 'Open 24 hours',
  heroLead: 'Caregivers on site, 24 hours a day — every day of the year.',
  address: {
    street: "6/6, St. Peter's Lane 2, Moratuwella",
    locality: 'Moratuwa',
    postalCode: '10400',
    country: 'LK',
    countryName: 'Sri Lanka',
    // One line, used for the map embed and display.
    full: "6/6, St. Peter's Lane 2, Moratuwella, Moratuwa 10400, Sri Lanka",
  },
  geo,
  maps: {
    // Pinned by coordinates rather than by the Google listing: the listing's
    // own pin sits on the wrong building and street. Worth correcting in
    // Google Business Profile too, so Search and Maps agree with the site.
    embed: `https://maps.google.com/maps?q=${geoQuery}&z=18&output=embed`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${geoQuery}`,
    link: `https://www.google.com/maps?q=${geoQuery}`,
    listing: 'https://maps.app.goo.gl/HJ7Fv7cHFs6aNFxN9',
  },
} as const;

export const nav = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#facilities', label: 'Facilities' },
  { href: '#why-us', label: 'Why Us' },
  { href: '#contact', label: 'Visit' },
] as const;

// Grouped for the "calm menu" layout: everyday life first, health and
// safety second. Order within each group matches the brief.
export const serviceGroups = [
  {
    name: 'Everyday life',
    items: [
      {
        title: 'Residential Care',
        description:
          'Comfortable, clean rooms where residents feel settled and at home, with help always close by.',
      },
      {
        title: 'Nutritious Meals',
        description:
          'Fresh, home-style meals prepared with care, with dietary needs and preferences respected.',
      },
      {
        title: 'Personal Hygiene Support',
        description:
          'Gentle, respectful help with bathing, grooming and dressing that protects dignity.',
      },
    ],
  },
  {
    name: 'Health and safety',
    items: [
      {
        title: '24-Hour Supervision',
        description:
          'Trained caregivers are on site day and night, so your loved one is never left unattended. A call bell beside every bed brings someone to the room.',
      },
      {
        title: 'Medication Assistance',
        description: 'Prescribed medicines given on time and as directed, with careful records kept.',
      },
      {
        title: 'Nursing Care',
        description: 'Attentive day-to-day nursing support for health needs, monitoring and recovery.',
      },
    ],
  },
] as const;

export const trustPoints = [
  {
    icon: 'clock',
    title: '24-hour staff',
    description: 'Caregivers on site around the clock, every day of the year.',
  },
  {
    icon: 'sparkle',
    title: 'Clean, modern',
    description: 'Bright, well-kept rooms and common areas that are easy and safe to move around.',
  },
  {
    icon: 'heart',
    title: 'Personalized care',
    description: 'Care that fits each resident’s routine, health needs and personality.',
  },
  {
    icon: 'pin',
    title: 'Central location',
    description: 'Close to family, shops and hospitals in Moratuwa, so visiting is easy.',
  },
] as const;

// Real reviews, given by the people named and used with their photographs.
// Longer ones are trimmed with an ellipsis; nothing is reworded. Any future
// entry marked `placeholder: true` renders only in `npm run dev`.
// `photo` is the filename prefix in src/assets/images.
export const testimonials: {
  quote: string;
  name: string;
  relation: string;
  photo?: string;
  placeholder: boolean;
}[] = [
  {
    quote:
      'My grandmother spent a wonderful time there, and the staff cared for her with genuine kindness, compassion, and professionalism… I wholeheartedly recommend Quick Care for elderly individuals, especially for families whose children are living abroad or have moved to another city and want the peace of mind of knowing their loved ones are receiving excellent care.',
    name: 'Mr. Premith Mendis',
    relation: 'Grandson of a resident · Google review',
    photo: 'person-premith-mendis',
    placeholder: false,
  },
  {
    quote:
      'I was afraid to come and stay in a home, but this is the first one I’ve ever stayed in, and I found everyone here so kind-hearted. They adapt to special needs — a special thank you to the caretakers for that. It truly feels like my own home.',
    name: 'Mrs. Shirani Perera',
    relation: 'Resident',
    photo: 'person-shirani-perera',
    placeholder: false,
  },
  {
    // Given in both Sinhala and English; her own English wording is used here.
    quote:
      'It doesn’t feel like a job, it feels like a family. The place is very clean, comfortable and peaceful… The grandmothers are so lovely and friendly. Best place to work and best care for elders!',
    name: 'Ms. Tharaka Medis',
    relation: 'Caregiver at Quick Care',
    photo: 'person-tharaka-medis',
    placeholder: false,
  },
];
