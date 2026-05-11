import type { Category } from '../types';

export const CATEGORY_STRUCTURE = [
  {
    slug: 'handbags',
    children: ['sacs-a-main', 'cabas-totes', 'pochettes'],
  },
  {
    slug: 'travel-bags',
    children: ['sacs-voyage', 'sacs-weekend'],
  },
  {
    slug: 'briefcases',
    children: ['mallettes', 'sacoches'],
  },
  {
    slug: 'accessories',
    children: ['belts', 'petite-maroquinerie', 'card-holders'],
  },
  {
    slug: 'gift-sets',
    children: [],
  },
  {
    slug: 'limited-collection',
    children: [],
  },
] as const;

const ORDER = CATEGORY_STRUCTURE.flatMap((x) => [x.slug, ...x.children]);

export function sortCategoriesByHierarchy(categories: Category[]): Category[] {
  const bySlug = new Map(categories.map((cat) => [cat.slug, cat]));
  const ordered: Category[] = [];
  for (const slug of ORDER) {
    const cat = bySlug.get(slug);
    if (cat) {
      ordered.push(cat);
      bySlug.delete(slug);
    }
  }

  return [...ordered, ...Array.from(bySlug.values())];
}

export function groupCategoriesByHierarchy(categories: Category[]) {
  const sorted = sortCategoriesByHierarchy(categories);
  const bySlug = new Map(sorted.map((cat) => [cat.slug, cat]));

  return CATEGORY_STRUCTURE.map((entry) => {
    const parent = bySlug.get(entry.slug);
    const children = entry.children
      .map((slug) => bySlug.get(slug))
      .filter((cat): cat is Category => Boolean(cat));
    return { parent, children };
  }).filter((entry): entry is { parent: Category; children: Category[] } => Boolean(entry.parent));
}
