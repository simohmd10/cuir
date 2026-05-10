import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useReveal } from '../hooks/useReveal';

interface Collection {
  id: string;
  href: string;
  labelAr: string;
  labelFr: string;
  titleAr: string;
  titleFr: string;
  subtitleAr: string;
  subtitleFr: string;
  image: string;
  objectPosition?: string;
  bg: string; // gradient shown while image loads
}

const COLLECTIONS: Collection[] = [
  // ① HERO — woman carrying brown leather tote
  {
    id: 'handbags',
    href: '/shop?category=handbags',
    labelAr: 'الماروكانية',
    labelFr: 'La Maroquinerie',
    titleAr: 'حقائب ومحافظ',
    titleFr: 'Sacs & Pièces',
    subtitleAr: 'القطع المميزة',
    subtitleFr: 'Pièces Maîtresses',
    image: '/collections/hero.jpg',
    objectPosition: 'center 15%',
    bg: 'linear-gradient(155deg, #2A1C14 0%, #3D2720 42%, #4D3428 72%, #5C3E30 100%)',
  },
  // ② TOP-RIGHT — travel duffel, Koutoubia backdrop
  {
    id: 'travel',
    href: '/shop?category=travel-bags',
    labelAr: 'رحلة',
    labelFr: 'Collection Voyage',
    titleAr: 'حقائب السفر',
    titleFr: 'Bagagerie Cuir',
    subtitleAr: 'رحلة',
    subtitleFr: 'Voyage',
    image: '/collections/voyage.jpg',
    objectPosition: 'center 30%',
    bg: 'linear-gradient(160deg, #1C1C1C 0%, #2D2420 48%, #3A2E28 78%, #4A3A30 100%)',
  },
  // ③ BOTTOM-RIGHT (hero row) — accessories flatlay
  {
    id: 'atelier',
    href: '/shop?category=accessories',
    labelAr: 'الأتيليه',
    labelFr: "L'Atelier",
    titleAr: 'إكسسوارات فاخرة',
    titleFr: 'Artisanat & Essentiels',
    subtitleAr: 'الأناقة في التفاصيل',
    subtitleFr: "L'Élégance des Détails",
    image: '/collections/atelier.jpg',
    objectPosition: 'center 40%',
    bg: 'linear-gradient(145deg, #181410 0%, #262018 52%, #342A20 82%, #3E3028 100%)',
  },
  // ④ ROW 2 LEFT — briefcase on a desk
  {
    id: 'briefcases',
    href: '/shop?category=briefcases',
    labelAr: 'رجال الأعمال',
    labelFr: 'Collection Mallette',
    titleAr: 'حقائب الأعمال',
    titleFr: 'Business Élégant',
    subtitleAr: 'رفيق العمل',
    subtitleFr: 'Compagnon de Travail',
    image: '/collections/briefcase.jpg',
    objectPosition: 'center 35%',
    bg: 'linear-gradient(155deg, #141618 0%, #1E2022 47%, #26241E 72%, #302C26 100%)',
  },
  // ⑤ ROW 2 CENTER — leather wallet flatlay
  {
    id: 'cardholders',
    href: '/shop?category=card-holders',
    labelAr: 'الأساسيات',
    labelFr: 'Cartes & Passeports',
    titleAr: 'حاملات البطاقات',
    titleFr: 'Porte-Cartes',
    subtitleAr: 'ضروريات يومية',
    subtitleFr: 'Essentiels du Quotidien',
    image: '/collections/cards.jpg',
    objectPosition: 'center 40%',
    bg: 'linear-gradient(140deg, #1C1814 0%, #2E2420 52%, #3C3028 82%, #4A3C30 100%)',
  },
  // ⑥ ROW 2 RIGHT — leather belt
  {
    id: 'belts',
    href: '/shop?category=belts',
    labelAr: 'الأحزمة',
    labelFr: 'Les Ceintures',
    titleAr: 'الأحزمة',
    titleFr: 'Ceintures Cuir',
    subtitleAr: 'جلد طبيعي',
    subtitleFr: 'Cuir Naturel',
    image: '/collections/belts.jpg',
    objectPosition: 'center 45%',
    bg: 'linear-gradient(150deg, #2A1C10 0%, #3A2418 50%, #4A3020 100%)',
  },
  // ⑦ BOTTOM LEFT LARGE — gift box set
  {
    id: 'gifts',
    href: '/shop?category=gift-sets',
    labelAr: 'هدايا راقية',
    labelFr: 'Cadeaux Cuir',
    titleAr: 'صناديق الهدايا',
    titleFr: 'Coffrets Artisanaux',
    subtitleAr: 'هدية فاخرة',
    subtitleFr: 'Coffret de Luxe',
    image: '/collections/gifts.jpg',
    objectPosition: '40% center',
    bg: 'linear-gradient(155deg, #1E1610 0%, #2C2016 47%, #3A2A1C 72%, #4A3824 100%)',
  },
  // ⑧ BOTTOM RIGHT LARGE — moody dark travel bag (cinematic)
  {
    id: 'limited',
    href: '/shop?category=limited-collection',
    labelAr: 'إصدار خاص',
    labelFr: 'Collection Limitée',
    titleAr: 'أعداد محدودة',
    titleFr: 'Atelier Edition',
    subtitleAr: 'إصدار محدود',
    subtitleFr: 'Édition Limitée',
    image: '/collections/limited.jpg',
    objectPosition: 'center 40%',
    bg: 'linear-gradient(145deg, #0E0C0A 0%, #18140E 42%, #221C14 67%, #2E2418 100%)',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   CollectionCard
───────────────────────────────────────────────────────────────────────────── */

function CollectionCard({
  collection,
  isLarge = false,
  isHero = false,
  className = '',
}: {
  collection: Collection;
  isLarge?: boolean;
  isHero?: boolean;
  className?: string;
}) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const label    = isAr ? collection.labelAr    : collection.labelFr;
  const title    = isAr ? collection.titleAr    : collection.titleFr;
  const subtitle = isAr ? collection.subtitleAr : collection.subtitleFr;

  return (
    <Link
      to={collection.href}
      className={`group relative overflow-hidden block bg-ink ${className}`}
    >
      {/* ── Gradient fallback (visible while image loads) ── */}
      <div
        className="absolute inset-0"
        style={{ background: collection.bg }}
        aria-hidden="true"
      />

      {/* ── Cinematic photo ── slow-zoom on hover ── */}
      <img
        src={collection.image}
        alt=""
        aria-hidden="true"
        loading={isHero ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={isHero ? 'high' : 'auto'}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-[var(--ease-luxury)] group-hover:scale-[1.07]"
        style={{
          objectPosition: collection.objectPosition ?? 'center',
          willChange: 'transform',
        }}
      />

      {/* ── Overlays (z above image) ── */}

      {/* Bottom-to-top gradient for text readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, rgba(8,4,2,0.78) 0%, rgba(8,4,2,0.30) 38%, rgba(0,0,0,0.06) 65%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top dark veil — prevents blown-out sky */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 30%)' }}
        aria-hidden="true"
      />

      {/* Peripheral vignette — draws eye to center */}
      <div
        className="absolute inset-0 z-[1] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, transparent 42%, rgba(0,0,0,0.60) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Typography ── */}
      <div
        className={[
          'absolute bottom-0 z-[2] w-full',
          isLarge || isHero ? 'p-8 md:p-10' : 'p-5 md:p-6',
        ].join(' ')}
      >
        {/* Collection label */}
        <p className="text-camel text-[10px] tracking-[0.28em] uppercase font-body mb-2 md:mb-3">
          {label}
        </p>

        {/* Main title */}
        <h3
          className={[
            'font-light text-cream-100 leading-[1.08]',
            isAr ? 'font-arabic' : 'font-display',
            isHero
              ? 'text-[1.75rem] md:text-[2.6rem]'
              : isLarge
              ? 'text-xl md:text-[1.9rem]'
              : 'text-base md:text-[1.15rem]',
          ].join(' ')}
        >
          {title}
        </h3>

        {/* Subtitle — softer, smaller */}
        <p
          className={[
            'mt-1.5 text-cream-100/50 font-body font-light leading-snug',
            isHero ? 'text-[13px] md:text-sm' : 'text-[11px] md:text-[12px]',
            isAr ? 'font-arabic' : '',
          ].join(' ')}
        >
          {subtitle}
        </p>

        {/* Animated camel underline on hover */}
        <div
          className="mt-4 h-px bg-camel/50 w-0 group-hover:w-8 transition-[width] duration-700 ease-[var(--ease-luxury)]"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CollectionsSection
───────────────────────────────────────────────────────────────────────────── */

export default function CollectionsSection() {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  const headingRef = useReveal({ rootMargin: '-48px' });

  return (
    <section className="bg-cream-100 py-20 md:py-28 lg:py-36" dir={dir}>
      <div className="container-luxury">

        {/* ── Section header ── */}
        <div ref={headingRef} className="reveal mb-14 md:mb-20 text-center">
          <p className="section-label">
            {isAr ? 'المجموعات' : 'Collections'}
          </p>
          <h2 className={['heading-section mt-3', isAr ? 'font-arabic' : ''].join(' ')}>
            {isAr ? 'مجموعات استثنائية' : "Maroquinerie d'Exception"}
          </h2>
          <p className="mt-5 font-body font-light text-ink/38 text-sm tracking-wide max-w-[28rem] mx-auto leading-relaxed">
            {isAr
              ? 'تشكيلة مختارة بعناية من الجلود المغربية الأصيلة، مصنوعة يدوياً'
              : 'Une sélection de pièces façonnées à la main, au cœur du Maroc'}
          </p>
        </div>

        {/* ── Editorial grid ── */}
        <div className="space-y-1.5 md:space-y-2">

          {/* ── ROW 1: Hero (58%) + 2 stacked right (42%) ── */}
          <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 md:min-h-[580px]">

            {/* ① Hero — tall portrait, eager-loaded */}
            <div className="w-full md:w-[58.33%] aspect-[3/4] md:aspect-auto">
              <CollectionCard
                collection={COLLECTIONS[0]}
                isHero
                className="h-full"
              />
            </div>

            {/* ② + ③ stacked right */}
            <div className="w-full md:w-[41.67%] flex flex-col gap-1.5 md:gap-2">
              <div className="flex-1 min-h-[220px] md:min-h-0 aspect-[4/3] md:aspect-auto">
                <CollectionCard collection={COLLECTIONS[1]} className="h-full" />
              </div>
              <div className="flex-1 min-h-[220px] md:min-h-0 aspect-[4/3] md:aspect-auto">
                <CollectionCard collection={COLLECTIONS[2]} className="h-full" />
              </div>
            </div>
          </div>

          {/* ── ROW 2: 3 equal cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
            <CollectionCard collection={COLLECTIONS[3]} className="aspect-[4/3]" />
            <CollectionCard collection={COLLECTIONS[4]} className="aspect-[4/3]" />
            {/* Full-width on mobile so the third doesn't look orphaned */}
            <CollectionCard
              collection={COLLECTIONS[5]}
              className="aspect-[4/3] col-span-2 md:col-span-1"
            />
          </div>

          {/* ── ROW 3: Wide dark (58%) + narrow (42%) ── */}
          <div className="flex flex-col md:flex-row gap-1.5 md:gap-2 md:min-h-[360px]">
            <div className="w-full md:w-[58.33%] aspect-[16/9] md:aspect-auto">
              <CollectionCard
                collection={COLLECTIONS[6]}
                isLarge
                className="h-full"
              />
            </div>
            <div className="w-full md:w-[41.67%] min-h-[240px] md:min-h-0">
              <CollectionCard
                collection={COLLECTIONS[7]}
                isLarge
                className="h-full"
              />
            </div>
          </div>
        </div>

        {/* ── Editorial footer link ── */}
        <div className="mt-14 md:mt-20 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-4 font-body text-[11px] tracking-[0.24em] uppercase text-ink/35 hover:text-camel transition-colors duration-500"
          >
            <span className="block w-10 h-px bg-current" aria-hidden="true" />
            {isAr ? 'استعراض جميع المجموعات' : 'Voir toutes les collections'}
            <span className="block w-10 h-px bg-current" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
