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
  bg: string;
}

/*
 * Each collection is presented as a curated editorial space, not a product filter.
 * Backgrounds are cinematic CSS gradients; replace bg with a real image URL
 * by adding  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
 * to the inner div once photography is available.
 */
const COLLECTIONS: Collection[] = [
  {
    id: 'handbags',
    href: '/shop?category=handbags',
    labelAr: 'الماروكانية',
    labelFr: 'La Maroquinerie',
    titleAr: 'حقائب ومحافظ',
    titleFr: 'Sacs & Pièces',
    bg: 'linear-gradient(155deg, #2A1C14 0%, #3D2720 42%, #4D3428 72%, #5C3E30 100%)',
  },
  {
    id: 'travel',
    href: '/shop?category=travel-bags',
    labelAr: 'رحلة',
    labelFr: 'Collection Voyage',
    titleAr: 'حقائب السفر',
    titleFr: 'Bagagerie Cuir',
    bg: 'linear-gradient(160deg, #1C1C1C 0%, #2D2420 48%, #3A2E28 78%, #4A3A30 100%)',
  },
  {
    id: 'atelier',
    href: '/shop?category=accessories',
    labelAr: 'الأتيليه',
    labelFr: "L'Atelier",
    titleAr: 'إكسسوارات فاخرة',
    titleFr: 'Artisanat & Essentiels',
    bg: 'linear-gradient(145deg, #181410 0%, #262018 52%, #342A20 82%, #3E3028 100%)',
  },
  {
    id: 'backpacks',
    href: '/shop?category=leather-backpacks',
    labelAr: 'حقائب الظهر',
    labelFr: 'Sacs à Dos',
    titleAr: 'جلد طبيعي',
    titleFr: 'Collection Quotidien',
    bg: 'linear-gradient(150deg, #1A1C1E 0%, #242422 47%, #2E2A24 72%, #3A3028 100%)',
  },
  {
    id: 'cardholders',
    href: '/shop?category=card-holders',
    labelAr: 'الأساسيات',
    labelFr: 'Cartes & Passeports',
    titleAr: 'محافظ البطاقات',
    titleFr: 'Essentiels Cuir',
    bg: 'linear-gradient(140deg, #1C1814 0%, #2E2420 52%, #3C3028 82%, #4A3C30 100%)',
  },
  {
    id: 'briefcases',
    href: '/shop?category=briefcases',
    labelAr: 'رجال الأعمال',
    labelFr: 'Collection Mallette',
    titleAr: 'حقائب الأعمال',
    titleFr: 'Business Élégant',
    bg: 'linear-gradient(155deg, #141618 0%, #1E2022 47%, #26241E 72%, #302C26 100%)',
  },
  {
    id: 'limited',
    href: '/shop?category=limited-collection',
    labelAr: 'إصدار خاص',
    labelFr: 'Collection Limitée',
    titleAr: 'أعداد محدودة',
    titleFr: 'Atelier Edition',
    bg: 'linear-gradient(145deg, #0E0C0A 0%, #18140E 42%, #221C14 67%, #2E2418 100%)',
  },
  {
    id: 'gifts',
    href: '/shop?category=gift-sets',
    labelAr: 'هدايا راقية',
    labelFr: 'Cadeaux Cuir',
    titleAr: 'صناديق الهدايا',
    titleFr: 'Coffrets Artisanaux',
    bg: 'linear-gradient(155deg, #1E1610 0%, #2C2016 47%, #3A2A1C 72%, #4A3824 100%)',
  },
];

function CollectionCard({
  collection,
  isLarge = false,
  className = '',
}: {
  collection: Collection;
  isLarge?: boolean;
  className?: string;
}) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const label = isAr ? collection.labelAr : collection.labelFr;
  const title = isAr ? collection.titleAr : collection.titleFr;

  return (
    <Link
      to={collection.href}
      className={`group relative overflow-hidden block bg-ink ${className}`}
    >
      {/* Cinematic background — slow zoom on hover */}
      <div
        className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-luxury)] group-hover:scale-[1.07]"
        style={{ background: collection.bg, willChange: 'transform' }}
        aria-hidden="true"
      />

      {/* Gradient overlay — bottom to top for text legibility */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to top, rgba(10,6,3,0.92) 0%, rgba(10,6,3,0.22) 44%, transparent 68%)',
        }}
        aria-hidden="true"
      />

      {/* Subtle edge vignette */}
      <div
        className="absolute inset-0 z-[1] opacity-35"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, transparent 45%, rgba(0,0,0,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Text content */}
      <div
        className={[
          'absolute bottom-0 z-[2] w-full',
          isLarge ? 'p-8 md:p-11' : 'p-5 md:p-7',
        ].join(' ')}
      >
        <p className="text-camel text-[10px] tracking-[0.28em] uppercase font-body mb-2 md:mb-3">
          {label}
        </p>
        <h3
          className={[
            'font-light text-cream-100 leading-[1.1]',
            isAr ? 'font-arabic' : 'font-display',
            isLarge ? 'text-2xl md:text-[2.4rem]' : 'text-[1.15rem] md:text-xl',
          ].join(' ')}
        >
          {title}
        </h3>

        {/* Animated underline on hover */}
        <div
          className="mt-4 h-px bg-camel/55 w-0 group-hover:w-9 transition-[width] duration-700 ease-[var(--ease-luxury)]"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

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
        <div className="space-y-2 md:space-y-2.5">

          {/* ── Row 1: Hero (7fr) + 2 stacked (5fr) ── */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 md:min-h-[580px]">
            <div className="w-full md:w-[58.33%] aspect-[3/4] md:aspect-auto">
              <CollectionCard
                collection={COLLECTIONS[0]}
                isLarge
                className="h-full"
              />
            </div>
            <div className="w-full md:w-[41.67%] flex flex-col gap-2 md:gap-2.5">
              <div className="flex-1 min-h-[200px]">
                <CollectionCard collection={COLLECTIONS[1]} className="h-full" />
              </div>
              <div className="flex-1 min-h-[200px]">
                <CollectionCard collection={COLLECTIONS[2]} className="h-full" />
              </div>
            </div>
          </div>

          {/* ── Row 2: 3 equal cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
            <CollectionCard collection={COLLECTIONS[3]} className="aspect-[4/3]" />
            <CollectionCard collection={COLLECTIONS[4]} className="aspect-[4/3]" />
            {/* Last card is full-width on mobile, 1/3 on desktop */}
            <CollectionCard
              collection={COLLECTIONS[5]}
              className="aspect-[4/3] col-span-2 md:col-span-1"
            />
          </div>

          {/* ── Row 3: Dramatic wide (7fr) + gift (5fr) ── */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-2.5 md:min-h-[360px]">
            <div className="w-full md:w-[58.33%] aspect-[16/9] md:aspect-auto">
              <CollectionCard
                collection={COLLECTIONS[6]}
                isLarge
                className="h-full"
              />
            </div>
            <div className="w-full md:w-[41.67%] min-h-[220px] md:min-h-0">
              <CollectionCard collection={COLLECTIONS[7]} className="h-full" />
            </div>
          </div>
        </div>

        {/* ── Footer link ── */}
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
