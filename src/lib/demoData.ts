import type { Category, Product, Review } from '../types';

/**
 * Catalogue de démonstration.
 *
 * Le site fonctionne en vitrine autonome, sans base de données : tant que
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ne sont pas définies, les hooks
 * de données servent ce catalogue au lieu d'interroger Supabase. Dès que ces
 * variables sont renseignées, le site bascule sur la vraie base sans qu'aucun
 * code n'ait à changer.
 *
 * Les photos proviennent de public/collections — déjà présentes dans le dépôt.
 */

export function isDemoMode(): boolean {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

const IMG = {
  handbag: '/collections/hero.jpg',
  tote: '/collections/atelier.jpg',
  travel: '/collections/voyage.jpg',
  briefcase: '/collections/briefcase.jpg',
  belt: '/collections/belts.jpg',
  cards: '/collections/cards.jpg',
  gift: '/collections/gifts.jpg',
  limited: '/collections/limited.jpg',
} as const;

const CATEGORY_LABELS: Record<string, { fr: string; name_ar: string; image: string }> = {
  // Parent et enfant ne doivent pas porter le même libellé : les deux
  // apparaissent côte à côte dans le filtre de la boutique.
  'handbags':            { fr: 'Sacs à main',          name_ar: 'حقائب يد',           image: IMG.handbag },
  'sacs-a-main':         { fr: 'Portés main',          name_ar: 'محمولة باليد',        image: IMG.handbag },
  'cabas-totes':         { fr: 'Cabas & Totes',        name_ar: 'حقائب كبيرة',        image: IMG.tote },
  'pochettes':           { fr: 'Pochettes',            name_ar: 'حقائب صغيرة',        image: IMG.cards },
  'travel-bags':         { fr: 'Voyage',               name_ar: 'السفر',              image: IMG.travel },
  'sacs-voyage':         { fr: 'Sacs de voyage',       name_ar: 'حقائب السفر',        image: IMG.travel },
  'sacs-weekend':        { fr: 'Sacs week-end',        name_ar: 'حقائب نهاية الأسبوع', image: IMG.travel },
  'briefcases':          { fr: 'Travail',              name_ar: 'العمل',              image: IMG.briefcase },
  'mallettes':           { fr: 'Mallettes',            name_ar: 'محافظ',              image: IMG.briefcase },
  'sacoches':            { fr: 'Sacoches',             name_ar: 'حقائب كتف',          image: IMG.briefcase },
  'accessories':         { fr: 'Accessoires',          name_ar: 'إكسسوارات',          image: IMG.belt },
  'belts':               { fr: 'Ceintures',            name_ar: 'أحزمة',              image: IMG.belt },
  'petite-maroquinerie': { fr: 'Petite maroquinerie',  name_ar: 'جلديات صغيرة',       image: IMG.cards },
  'card-holders':        { fr: 'Porte-cartes',         name_ar: 'حافظات بطاقات',      image: IMG.cards },
  'gift-sets':           { fr: 'Coffrets cadeaux',     name_ar: 'علب الهدايا',        image: IMG.gift },
  'limited-collection':  { fr: 'Édition limitée',      name_ar: 'إصدار محدود',        image: IMG.limited },
};

const PARENT_OF: Record<string, string | null> = {
  'handbags': null, 'travel-bags': null, 'briefcases': null,
  'accessories': null, 'gift-sets': null, 'limited-collection': null,
  'sacs-a-main': 'handbags', 'cabas-totes': 'handbags', 'pochettes': 'handbags',
  'sacs-voyage': 'travel-bags', 'sacs-weekend': 'travel-bags',
  'mallettes': 'briefcases', 'sacoches': 'briefcases',
  'belts': 'accessories', 'petite-maroquinerie': 'accessories', 'card-holders': 'accessories',
};

export const DEMO_CATEGORIES: Category[] = Object.keys(CATEGORY_LABELS).map((slug) => ({
  id: `demo-cat-${slug}`,
  name: CATEGORY_LABELS[slug].fr,
  name_ar: CATEGORY_LABELS[slug].name_ar,
  slug,
  image: CATEGORY_LABELS[slug].image,
  parent_slug: PARENT_OF[slug] ?? null,
}));

interface Seed {
  name: string;
  name_ar: string;
  price: number;
  original_price?: number;
  category: string;
  image: string;
  stock: number;
  rating: number;
  review_count: number;
  badge?: string;
  badge_ar?: string;
  colors: string[];
  sizes: string[];
  is_featured?: boolean;
  is_best_seller?: boolean;
  description: string;
  description_ar: string;
}

const SEEDS: Seed[] = [
  {
    name: 'Sac Marrakech', name_ar: 'حقيبة مراكش',
    price: 1290, original_price: 1590, category: 'sacs-a-main', image: IMG.handbag,
    stock: 8, rating: 4.8, review_count: 24, badge: 'Nouveau', badge_ar: 'جديد',
    colors: ['Cognac', 'Noir', 'Camel'], sizes: ['Unique'],
    is_featured: true, is_best_seller: true,
    description: 'Sac à main en cuir pleine fleur tanné végétalement, cousu main dans notre atelier de Marrakech. Doublure en peau d\'agneau et fermoir en laiton massif.',
    description_ar: 'حقيبة يد من الجلد الطبيعي المدبوغ نباتياً، مخيطة يدوياً في ورشتنا بمراكش.',
  },
  {
    name: 'Cabas Médina', name_ar: 'حقيبة المدينة',
    price: 1490, category: 'cabas-totes', image: IMG.tote,
    stock: 5, rating: 4.9, review_count: 31,
    colors: ['Naturel', 'Chocolat'], sizes: ['Grand', 'Moyen'],
    is_featured: true, is_best_seller: true,
    description: 'Cabas spacieux en cuir souple, parfait pour le quotidien. Deux anses renforcées et poche intérieure zippée.',
    description_ar: 'حقيبة واسعة من الجلد الناعم، مثالية للاستعمال اليومي.',
  },
  {
    name: 'Pochette Atlas', name_ar: 'حقيبة أطلس',
    price: 590, original_price: 740, category: 'pochettes', image: IMG.cards,
    stock: 12, rating: 4.6, review_count: 18, badge: 'Promo', badge_ar: 'تخفيض',
    colors: ['Noir', 'Bordeaux'], sizes: ['Unique'],
    is_featured: true,
    description: 'Pochette de soirée en cuir grainé, finition main et doublure satinée.',
    description_ar: 'حقيبة سهرة من الجلد المحبب بتشطيب يدوي.',
  },
  {
    name: 'Sac de voyage Sahara', name_ar: 'حقيبة سفر الصحراء',
    price: 2490, category: 'sacs-voyage', image: IMG.travel,
    stock: 3, rating: 5.0, review_count: 12, badge: 'Édition limitée', badge_ar: 'إصدار محدود',
    colors: ['Cognac', 'Noir'], sizes: ['Unique'],
    is_featured: true, is_best_seller: true,
    description: 'Sac de voyage en cuir épais, renforcé aux angles. Bandoulière amovible et compartiment à chaussures séparé.',
    description_ar: 'حقيبة سفر من الجلد السميك مع حزام كتف قابل للفصل.',
  },
  {
    name: 'Week-end Essaouira', name_ar: 'حقيبة الصويرة',
    price: 1890, category: 'sacs-weekend', image: IMG.travel,
    stock: 6, rating: 4.7, review_count: 9,
    colors: ['Camel', 'Gris'], sizes: ['Unique'],
    is_featured: true,
    description: 'Format cabine, cuir patiné à la main. Conçu pour les escapades de deux jours.',
    description_ar: 'بحجم مقصورة الطائرة، جلد مصقول يدوياً.',
  },
  {
    name: 'Serviette Fès', name_ar: 'حقيبة فاس',
    price: 2190, original_price: 2490, category: 'mallettes', image: IMG.briefcase,
    stock: 4, rating: 4.8, review_count: 15,
    colors: ['Noir', 'Chocolat'], sizes: ['Unique'],
    is_featured: true, is_best_seller: true,
    description: 'Serviette porte-documents avec compartiment ordinateur 15". Serrure à combinaison en laiton.',
    description_ar: 'حقيبة أوراق مع حيّز لحاسوب 15 بوصة وقفل نحاسي.',
  },
  {
    name: 'Sacoche Rabat', name_ar: 'حقيبة الرباط',
    price: 990, category: 'sacoches', image: IMG.briefcase,
    stock: 10, rating: 4.5, review_count: 21,
    colors: ['Cognac', 'Noir', 'Olive'], sizes: ['Unique'],
    description: 'Sacoche bandoulière compacte, idéale pour tablette et carnets.',
    description_ar: 'حقيبة كتف صغيرة مناسبة للوحي والدفاتر.',
  },
  {
    name: 'Ceinture Tanger', name_ar: 'حزام طنجة',
    price: 390, category: 'belts', image: IMG.belt,
    stock: 25, rating: 4.6, review_count: 42,
    colors: ['Noir', 'Marron', 'Cognac'], sizes: ['85', '90', '95', '100'],
    is_best_seller: true,
    description: 'Ceinture en cuir pleine fleur, boucle en laiton brossé. Épaisseur 3,5 mm.',
    description_ar: 'حزام من الجلد الطبيعي بإبزيم نحاسي، سماكة ٣٫٥ مم.',
  },
  {
    name: 'Porte-cartes Chefchaouen', name_ar: 'حافظة بطاقات شفشاون',
    price: 290, original_price: 350, category: 'card-holders', image: IMG.cards,
    stock: 30, rating: 4.7, review_count: 56, badge: 'Promo', badge_ar: 'تخفيض',
    colors: ['Bleu', 'Noir', 'Cognac'], sizes: ['Unique'],
    is_best_seller: true,
    description: 'Porte-cartes six emplacements, cuir fin et couture sellier.',
    description_ar: 'حافظة بستة جيوب، جلد رقيق وخياطة سرجية.',
  },
  {
    name: 'Portefeuille Casablanca', name_ar: 'محفظة الدار البيضاء',
    price: 490, category: 'petite-maroquinerie', image: IMG.cards,
    stock: 18, rating: 4.4, review_count: 27,
    colors: ['Noir', 'Marron'], sizes: ['Unique'],
    description: 'Portefeuille deux volets avec porte-monnaie zippé.',
    description_ar: 'محفظة بطيّتين مع جيب نقود بسحّاب.',
  },
  {
    name: 'Coffret Héritage', name_ar: 'علبة التراث',
    price: 1690, category: 'gift-sets', image: IMG.gift,
    stock: 7, rating: 4.9, review_count: 11, badge: 'Coffret', badge_ar: 'علبة',
    colors: ['Cognac'], sizes: ['Unique'],
    is_featured: true,
    description: 'Coffret cadeau : ceinture, porte-cartes et portefeuille assortis, présentés dans un écrin en bois de cèdre.',
    description_ar: 'علبة هدايا: حزام وحافظة بطاقات ومحفظة في صندوق من خشب الأرز.',
  },
  {
    name: 'Sac Atelier N°1', name_ar: 'حقيبة الورشة رقم ١',
    price: 3490, category: 'limited-collection', image: IMG.limited,
    stock: 2, rating: 5.0, review_count: 6, badge: 'Édition limitée', badge_ar: 'إصدار محدود',
    colors: ['Cognac'], sizes: ['Unique'],
    is_featured: true, is_best_seller: true,
    description: 'Pièce unique numérotée, façonnée par notre maître artisan. Cuir vieilli douze mois, finition cire d\'abeille.',
    description_ar: 'قطعة فريدة مرقّمة، صنعها حرفيّنا الأوّل. جلد معتّق اثني عشر شهراً.',
  },
];

const DAY = 86_400_000;

export const DEMO_PRODUCTS: Product[] = SEEDS.map((s, i) => ({
  id: `demo-${i + 1}`,
  name: s.name,
  name_ar: s.name_ar,
  description: s.description,
  description_ar: s.description_ar,
  price: s.price,
  original_price: s.original_price,
  category: s.category,
  images: [s.image],
  stock: s.stock,
  rating: s.rating,
  review_count: s.review_count,
  badge: s.badge,
  badge_ar: s.badge_ar,
  colors: s.colors,
  sizes: s.sizes,
  is_featured: s.is_featured ?? false,
  is_best_seller: s.is_best_seller ?? false,
  // Décroissant, pour que le tri « plus récent » donne un ordre stable.
  created_at: new Date(Date.now() - i * DAY).toISOString(),
})) as Product[];

const REVIEW_SEEDS = [
  { user_name: 'Yasmine B.',  rating: 5, comment: 'La finition est superbe, le cuir sent merveilleusement bon. Livraison rapide à Casablanca.' },
  { user_name: 'Omar T.',     rating: 5, comment: 'Qualité largement au-dessus du prix. Je recommande sans hésiter.' },
  { user_name: 'Sofia M.',    rating: 4, comment: 'Très beau sac, un peu plus petit que prévu mais la qualité est là.' },
  { user_name: 'Karim L.',    rating: 5, comment: 'Deuxième achat chez Cuir. Toujours impeccable.' },
];

export const DEMO_REVIEWS: Review[] = DEMO_PRODUCTS.flatMap((p, pi) =>
  REVIEW_SEEDS.slice(0, (pi % 3) + 2).map((r, ri) => ({
    id: `demo-review-${pi}-${ri}`,
    product_id: p.id,
    user_name: r.user_name,
    rating: r.rating,
    comment: r.comment,
    status: 'approved' as const,
    created_at: new Date(Date.now() - (pi * 3 + ri) * DAY).toISOString(),
  })),
);

/** Applique localement les mêmes filtres/tris que la requête Supabase. */
export function filterDemoProducts(options?: {
  category?: string;
  categories?: string[];
  search?: string;
  sortBy?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  limit?: number;
}): Product[] {
  let out = [...DEMO_PRODUCTS];

  if (options?.categories?.length) {
    out = out.filter((p) => options.categories!.includes(p.category));
  } else if (options?.category && options.category !== 'all') {
    out = out.filter((p) => p.category === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    out = out.filter(
      (p) => p.name.toLowerCase().includes(q) || p.name_ar.toLowerCase().includes(q),
    );
  }

  if (options?.isFeatured) out = out.filter((p) => p.is_featured);
  if (options?.isBestSeller) out = out.filter((p) => p.is_best_seller);

  switch (options?.sortBy) {
    case 'price_asc':  out.sort((a, b) => a.price - b.price); break;
    case 'price_desc': out.sort((a, b) => b.price - a.price); break;
    case 'rating':     out.sort((a, b) => b.rating - a.rating); break;
    default:
      out.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  }

  return options?.limit ? out.slice(0, options.limit) : out;
}
