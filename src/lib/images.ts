import type { ImageMetadata } from 'astro';

// Photos live in src/assets/images so Astro can optimise them (resize + WebP).
//   hero.jpg                    -> hero image (also used as og:image)
//   gallery-<label>-<n>.jpg     -> gallery, e.g. gallery-bedroom-1.jpg
//   logo*.png                   -> brand marks, imported directly by components
// Everything degrades to a neutral placeholder while the folder is empty.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const entries = Object.entries(modules)
  .map(([path, mod]) => ({ name: path.split('/').pop()!.replace(/\.\w+$/, ''), image: mod.default }))
  // Brand marks are not photographs; keep them out of the hero and gallery.
  .filter((e) => !/^logo/i.test(e.name))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

export const heroImage = entries.find((e) => e.name.startsWith('hero'))?.image;

/** One photo by filename prefix, e.g. photo('gallery-dining-area'). */
export const photo = (prefix: string): ImageMetadata | undefined =>
  entries.find((e) => e.name.startsWith(prefix))?.image;

export const galleryImages = entries
  .filter((e) => e.name.startsWith('gallery'))
  .map((e) => {
    // "gallery-common-room-2" -> "Common room"
    const label = e.name
      .replace(/^gallery[-_]?/, '')
      .replace(/[-_]?\d+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    const text = label ? label.charAt(0).toUpperCase() + label.slice(1) : 'Facility';
    return { image: e.image, label: text, alt: `${text} at Quick Care Elders Home, Moratuwa` };
  });
