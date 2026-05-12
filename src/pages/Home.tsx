import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Leaf, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
import { getImageUrl } from '../lib/utils';
import { useReveal, useRevealGroup } from '../hooks/useReveal';
import HeroVideo from '../components/HeroVideo';
import CollectionsSection from '../components/CollectionsSection';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';

/* ─────────────────────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    quote_ar: 'حقيبة رائعة بجودة استثنائية! وصلت في وقت قياسي وأنا سعيدة جداً',
    quote_fr: 'Qualité exceptionnelle, exactement comme sur les photos. Je recommande vivement!',
    name_ar: 'سارة م.',
    name_fr: 'Sara M.',
    city_ar: 'الدار البيضاء',
    city_fr: 'Casablanca',
  },
  {
    quote_ar: 'أفضل حقيبة اشتريتها في حياتي. الجلد الطبيعي يشعرك بالفخامة الحقيقية',
    quote_fr: 'Qualité exceptionnelle, exactement comme sur les photos. Je recommande vivement!',
    name_ar: 'ليلى ب.',
    name_fr: 'Layla B.',
    city_ar: 'الرباط',
    city_fr: 'Rabat',
  },
  {
    quote_ar: 'أفضل حقيبة اشتريتها في حياتي. الجلد الطبيعي يشعرك بالفخامة الحقيقية',
    quote_fr: 'Sac magnifique, cuir souple et couture parfaite. Je la recommande à toutes mes amies.',
    name_ar: 'خديجة ر.',
    name_fr: 'Khadija R.',
    city_ar: 'مراكش',
    city_fr: 'Marrakech',
  },
] as const;

const EDITORIAL_FEATURES = [
  {
    num: '01',
    title_ar: 'الجودة',
    title_fr: 'Qualité Supérieure',
    desc_ar: 'نختار أجود أنواع الجلود الطبيعية من المدابغ العريقة',
    desc_fr: 'Nous sélectionnons les meilleurs cuirs dans les tanneries traditionnelles',
  },
  {
    num: '02',
    title_ar: 'الحرفية',
    title_fr: 'Savoir-faire Artisanal',
    desc_ar: 'كل قطعة تُصنع بيدي حرفيين مغاربة متمرسين',
    desc_fr: 'Chaque pièce est façonnée à la main par des artisans marocains experts',
  },
  {
    num: '03',
    title_ar: 'الأصالة',
    title_fr: 'Authenticité Marocaine',
    desc_ar: 'تراث عريق يمتد لقرون من قلب مدينة مراكش',
    desc_fr: "Un héritage séculaire au cœur de la médina de Marrakech",
  },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────────────────── */

const SectionLabel = memo(function SectionLabel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`section-label ${className}`}>{children}</p>;
});

const Stars = memo(function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-gold fill-current" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
});

const TrustBar = memo(function TrustBar() {
  const { t } = useLanguage();
  const items = [
    { icon: <Truck className="w-4 h-4" />, label: t('deliveryDays') },
    { icon: <Leaf className="w-4 h-4" />, label: t('authenticLeather') },
    { icon: <Shield className="w-4 h-4" />, label: t('cashOnDelivery') },
  ];
  return (
    <div className="bg-white border-y border-black/10 py-5">
      <div className="container-luxury">
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-ink/70">
              <span className="text-ink">{item.icon}</span>
              <span className="font-body text-[11px] tracking-luxury uppercase">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const DeliveryBanner = memo(function DeliveryBanner() {
  const { t } = useLanguage();
  return (
    <div className="bg-white border-b border-black/10 py-5 text-center">
      <p className="font-display italic text-2xl text-ink px-4">
        {t('freeDelivery')}
      </p>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   Home page
───────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const { lang, dir, t } = useLanguage();
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  /* ── Data fetching ─────────────────────────────────────────────────────── */
  const { data: featured, isLoading: featuredLoading } = useProducts({ isFeatured: true, limit: 8 });
  const { data: bestSellers, isLoading: bestSellersLoading } = useProducts({ isBestSeller: true, limit: 4 });

  /* ── SEO ───────────────────────────────────────────────────────────────── */
  usePageMeta(
    isAr ? 'كوير — حقائب جلدية فاخرة من المغرب' : 'CUIR — Maroquinerie de Luxe du Maroc',
    isAr
      ? 'اكتشف حقائبنا وإكسسواراتنا من الجلد الطبيعي، مصنوعة يدويًا في مراكش.'
      : 'Découvrez nos sacs et accessoires en cuir naturel, façonnés à la main par des artisans marocains.',
  );

  /* ── Reveal refs ───────────────────────────────────────────────────────── */
  const featuredHeadingRef = useReveal({ delay: 0 });
  const featuredGridRef  = useRevealGroup();
  const featuredCtaRef   = useReveal({ delay: 200 });
  const storyLeftRef     = useReveal({ delay: 0 });
  const storyRightRef    = useRevealGroup();
  const bestHeadingRef   = useReveal({ delay: 0 });
  const bestGridRef      = useRevealGroup();
  const testimonialsHeadingRef = useReveal({ delay: 0 });
  const testimonialsGridRef    = useRevealGroup();

  return (
    <div className="min-h-screen bg-white" dir={dir}>

      {/* ══ Hero ══════════════════════════════════════════════════════════════ */}
      <HeroVideo videoSrc="/hero.webm" posterSrc="/hero-poster.jpg" />

      {/* ══ Trust Bar ════════════════════════════════════════════════════════ */}
      <TrustBar />

      {/* ══ Collections ══════════════════════════════════════════════════════ */}
      <CollectionsSection />

      {/* ══ Featured Products ═══════════════════════════════════════════════ */}
      <section className="section-luxury bg-white">
        <div className="container-luxury">

          <div ref={featuredHeadingRef} className="reveal mb-8 md:mb-12 text-center">
            <SectionLabel>{t('featuredProducts')}</SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'حصري ومميز' : "Pièces d'Exception"}
            </h2>
          </div>

          <div ref={featuredGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 reveal-group">
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="reveal"><ProductCardSkeleton /></div>
                ))
              : featured?.map((product, index) => (
                  <div key={product.id} className="reveal">
                    <ProductCard product={product} priority={index < 2} />
                  </div>
                ))}
          </div>

          <div ref={featuredCtaRef} className="reveal mt-10 md:mt-12 flex justify-center">
            <Link to="/shop" className="btn-ghost inline-flex items-center gap-3">
              <span>{t('allProducts')}</span>
              <ArrowIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ Editorial Story ══════════════════════════════════════════════════ */}
      <section className="section-luxury bg-white text-ink border-y border-black/10">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">

            <div ref={storyLeftRef} className="reveal">
              <SectionLabel className="text-ink/60">{t('ourStory')}</SectionLabel>
              <blockquote
                className={[
                  'mt-8 font-light leading-[1.15] text-ink',
                  isAr
                    ? 'font-arabic text-[clamp(2rem,4.5vw,3.25rem)]'
                    : 'font-display italic text-[clamp(1.9rem,4vw,3rem)]',
                ].join(' ')}
              >
                {isAr ? (
                  <>الجلد ليس مجرد مادة،<br />إنه حكاية تُروى<br />بكل غرزة</>
                ) : (
                  <>Le cuir n&apos;est pas qu&apos;une matière,<br />c&apos;est une histoire racontée<br />à chaque point de couture</>
                )}
              </blockquote>
              <div className="mt-10 md:mt-12">
                <Link
                  to="/about"
                  className="btn-ghost inline-flex items-center gap-3"
                >
                  <span>{isAr ? 'اكتشف قصتنا' : 'Découvrir notre histoire'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>

            <div ref={storyRightRef} className="space-y-7 md:space-y-8 reveal-group">
              {EDITORIAL_FEATURES.map((feat) => (
                <div key={feat.num} className="flex gap-6 md:gap-8 items-start reveal">
                  <span
                    className="font-display text-5xl font-light text-gold/50 leading-none tabular-nums shrink-0 select-none"
                    aria-hidden="true"
                  >
                    {feat.num}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-light text-ink mb-1">
                      {isAr ? feat.title_ar : feat.title_fr}
                    </h3>
                    <p className="font-body text-sm text-ink/65 leading-relaxed">
                      {isAr ? feat.desc_ar : feat.desc_fr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Best Sellers ══════════════════════════════════════════════════════ */}
      <section className="section-luxury bg-white">
        <div className="container-luxury">

          <div ref={bestHeadingRef} className="reveal mb-8 md:mb-12 text-center">
            <SectionLabel>{t('bestSellers')}</SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'ما يعشقه عملاؤنا' : 'Nos Favoris'}
            </h2>
          </div>

          <div ref={bestGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 reveal-group">
            {bestSellersLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="reveal"><ProductCardSkeleton /></div>
                ))
              : bestSellers?.map((product, index) => (
                  <div key={product.id} className="reveal">
                    <ProductCard product={product} priority={index < 2} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ══ Delivery Banner ══════════════════════════════════════════════════ */}
      <DeliveryBanner />

      {/* ══ Testimonials ══════════════════════════════════════════════════════ */}
      <section className="section-luxury bg-white">
        <div className="container-luxury">

          <div ref={testimonialsHeadingRef} className="reveal mb-8 md:mb-12 text-center">
            <SectionLabel>{t('testimonials')}</SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'ما يقوله عملاؤنا' : 'Ce que disent nos clients'}
            </h2>
          </div>

          <div ref={testimonialsGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 reveal-group">
            {TESTIMONIALS.map((t, i) => (
              <article
                key={i}
                className="reveal bg-cream-50 border border-cream-300 p-5 md:p-8 flex flex-col gap-5 md:gap-6"
              >
                <Stars />
                <blockquote
                  className={[
                    'flex-1 text-ink/80 leading-relaxed',
                    isAr ? 'font-arabic text-base' : 'font-display italic text-lg',
                  ].join(' ')}
                >
                  &ldquo;{isAr ? t.quote_ar : t.quote_fr}&rdquo;
                </blockquote>
                <footer className="border-t border-cream-300 pt-5">
                  <p className={['font-body font-medium text-ink text-sm', isAr ? 'font-arabic' : ''].join(' ')}>
                    {isAr ? t.name_ar : t.name_fr}
                  </p>
                  <p className="label-luxury mt-0.5">{isAr ? t.city_ar : t.city_fr}</p>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
