import { memo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Truck, Leaf, Shield, ArrowRight, ArrowLeft } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getImageUrl } from '../lib/utils';
import HeroVideo from '../components/HeroVideo';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';

/* ─────────────────────────────────────────────────────────────────────────────
   Motion constants
───────────────────────────────────────────────────────────────────────────── */

const EASE_LUXURY = [0.25, 0.46, 0.45, 0.94] as const;

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_LUXURY },
  },
};

const STAGGER_GRID = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const GRID_ITEM = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_LUXURY },
  },
};

const VIEWPORT = { once: true, margin: '-80px' } as const;

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
   Sub-components (memo'd for perf on static sections)
───────────────────────────────────────────────────────────────────────────── */

/** Tiny section overline label */
const SectionLabel = memo(function SectionLabel({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`section-label ${className}`}>{children}</p>;
});

/** Five gold stars — pure SVG, no extra dep */
const Stars = memo(function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5 text-gold fill-current"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
});

/** Trust-bar strip — below hero */
const TrustBar = memo(function TrustBar({ lang }: { lang: 'ar' | 'fr' }) {
  const items = [
    {
      icon: <Truck className="w-4 h-4" />,
      label: lang === 'ar' ? 'توصيل 2-5 أيام' : 'Livraison 2–5 jours',
    },
    {
      icon: <Leaf className="w-4 h-4" />,
      label: lang === 'ar' ? 'جلد طبيعي أصيل' : 'Cuir naturel authentique',
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison',
    },
  ];

  return (
    <div className="bg-cream-200 py-5">
      <div className="container-luxury">
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-2 text-ink/70"
            >
              <span className="text-camel">{item.icon}</span>
              <span className="font-body text-[11px] tracking-luxury uppercase">
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

/** Delivery banner — full-width camel strip */
const DeliveryBanner = memo(function DeliveryBanner({
  lang,
}: {
  lang: 'ar' | 'fr';
}) {
  return (
    <div className="bg-camel py-5 text-center">
      <p className="font-display italic text-2xl text-ink px-4">
        {lang === 'ar'
          ? 'توصيل مجاني للطلبات فوق 500 درهم | Livraison gratuite dès 500 DH'
          : 'Livraison gratuite dès 500 DH | توصيل مجاني فوق 500 درهم'}
      </p>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
   Home page
───────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  const shouldReduceMotion = useReducedMotion();

  /* ── Data fetching ─────────────────────────────────────────────────────── */
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featured, isLoading: featuredLoading } = useProducts({
    isFeatured: true,
    limit: 8,
  });
  const { data: bestSellers, isLoading: bestSellersLoading } = useProducts({
    isBestSeller: true,
    limit: 4,
  });

  /* ── SEO ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    document.title = isAr
      ? 'كوير — حقائب جلدية فاخرة من المغرب'
      : 'CUIR — Maroquinerie de Luxe du Maroc';
  }, [isAr]);

  /* ── Animation helpers ─────────────────────────────────────────────────── */
  // Strip animation props entirely when user prefers reduced motion
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: VIEWPORT,
      };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-cream-100" dir={dir}>

      {/* ══ Section 1 — Hero ══════════════════════════════════════════════════ */}
      <HeroVideo />

      {/* ══ Section 2 — Trust Bar ════════════════════════════════════════════ */}
      <TrustBar lang={lang} />

      {/* ══ Section 3 — Shop by Category ════════════════════════════════════ */}
      <section className="section-luxury bg-cream-100">
        <div className="container-luxury">

          {/* Heading */}
          <motion.div
            {...motionProps}
            variants={FADE_UP}
            className="mb-14 text-center"
          >
            <SectionLabel>
              {isAr ? 'الفئات — Catégories' : 'Catégories — الفئات'}
            </SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'تسوق حسب الفئة' : 'Explorer par Catégorie'}
            </h2>
          </motion.div>

          {/* Category grid */}
          <motion.div
            {...motionProps}
            variants={STAGGER_GRID}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {categoriesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton rounded-none"
                    style={{ aspectRatio: '4/5' }}
                    aria-hidden="true"
                  />
                ))
              : categories?.map((cat) => (
                  <motion.div key={cat.id} variants={GRID_ITEM}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className="group relative block overflow-hidden"
                      aria-label={isAr ? cat.name_ar : cat.name}
                    >
                      {/* Image wrapper */}
                      <div
                        className="relative overflow-hidden"
                        style={{ aspectRatio: '4/5' }}
                      >
                        {cat.image ? (
                          <img
                            src={getImageUrl(cat.image)}
                            alt={isAr ? cat.name_ar : cat.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-[800ms] ease-[var(--ease-luxury)] group-hover:scale-105"
                          />
                        ) : (
                          /* Warm leather gradient fallback — no inline style needed */
                          <div
                            className="w-full h-full"
                            style={{
                              background:
                                'linear-gradient(135deg, #C4A882 0%, #9A7A52 50%, #7D6040 100%)',
                            }}
                          />
                        )}

                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent transition-opacity duration-[600ms] group-hover:from-ink/80" />

                        {/* Category label */}
                        <div className="absolute bottom-0 inset-x-0 p-5">
                          <p className="font-display text-xl text-cream-50 font-light leading-snug">
                            {isAr ? cat.name_ar : cat.name}
                          </p>
                          {cat.product_count != null && cat.product_count > 0 && (
                            <p className="mt-1 text-[11px] tracking-luxury uppercase text-camel font-body">
                              {cat.product_count}{' '}
                              {isAr ? 'منتج' : 'produits'}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ══ Section 4 — Featured Products ═══════════════════════════════════ */}
      <section className="section-luxury bg-cream-200">
        <div className="container-luxury">

          <motion.div
            {...motionProps}
            variants={FADE_UP}
            className="mb-14 text-center"
          >
            <SectionLabel>
              {isAr ? 'منتجات مميزة — Sélection' : 'Sélection — منتجات مميزة'}
            </SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'حصري ومميز' : "Pièces d'Exception"}
            </h2>
          </motion.div>

          <motion.div
            {...motionProps}
            variants={STAGGER_GRID}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <motion.div key={i} variants={GRID_ITEM}>
                    <ProductCardSkeleton />
                  </motion.div>
                ))
              : featured?.map((product) => (
                  <motion.div key={product.id} variants={GRID_ITEM}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </motion.div>

          {/* View all CTA */}
          <motion.div
            {...motionProps}
            variants={FADE_UP}
            className="mt-14 flex justify-center"
          >
            <Link
              to="/shop"
              className="btn-ghost inline-flex items-center gap-3"
            >
              <span>
                {isAr ? 'عرض جميع المنتجات' : 'Voir tous les produits'}
              </span>
              <ArrowIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══ Section 5 — Editorial Story (no image) ═══════════════════════════ */}
      <section className="section-luxury bg-ink text-cream-100">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left — large quote */}
            <motion.div {...motionProps} variants={FADE_UP}>
              <SectionLabel className="text-camel">
                {isAr ? 'قصتنا — Notre Histoire' : 'Notre Histoire — قصتنا'}
              </SectionLabel>

              <blockquote
                className={[
                  'mt-8 font-light leading-[1.15] text-cream-100',
                  isAr
                    ? 'font-arabic text-[clamp(2rem,4.5vw,3.25rem)]'
                    : 'font-display italic text-[clamp(1.9rem,4vw,3rem)]',
                ].join(' ')}
              >
                {isAr ? (
                  <>
                    الجلد ليس مجرد مادة،
                    <br />
                    إنه حكاية تُروى
                    <br />
                    بكل غرزة
                  </>
                ) : (
                  <>
                    Le cuir n&apos;est pas qu&apos;une matière,
                    <br />
                    c&apos;est une histoire racontée
                    <br />
                    à chaque point de couture
                  </>
                )}
              </blockquote>

              <div className="mt-12">
                <Link
                  to="/about"
                  className="btn-ghost text-cream-100 border-cream-100 hover:bg-cream-100 hover:text-ink inline-flex items-center gap-3"
                >
                  <span>
                    {isAr ? 'اكتشف قصتنا' : 'Découvrir notre histoire'}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </motion.div>

            {/* Right — numbered features */}
            <motion.div
              {...motionProps}
              variants={STAGGER_GRID}
              className="space-y-10"
            >
              {EDITORIAL_FEATURES.map((feat) => (
                <motion.div
                  key={feat.num}
                  variants={GRID_ITEM}
                  className="flex gap-6 md:gap-8 items-start"
                >
                  <span
                    className="font-display text-5xl font-light text-gold/50 leading-none tabular-nums shrink-0 select-none"
                    aria-hidden="true"
                  >
                    {feat.num}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-light text-cream-100 mb-1">
                      {isAr
                        ? `${feat.title_ar} / ${feat.title_fr}`
                        : `${feat.title_fr} / ${feat.title_ar}`}
                    </h3>
                    <p className="font-body text-sm text-cream-100/60 leading-relaxed">
                      {isAr ? feat.desc_ar : feat.desc_fr}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ Section 6 — Best Sellers ══════════════════════════════════════════ */}
      <section className="section-luxury bg-cream-100">
        <div className="container-luxury">

          <motion.div
            {...motionProps}
            variants={FADE_UP}
            className="mb-14 text-center"
          >
            <SectionLabel>
              {isAr
                ? 'الأكثر مبيعاً — Best-sellers'
                : 'Best-sellers — الأكثر مبيعاً'}
            </SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'ما يعشقه عملاؤنا' : 'Nos Favoris'}
            </h2>
          </motion.div>

          <motion.div
            {...motionProps}
            variants={STAGGER_GRID}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {bestSellersLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <motion.div key={i} variants={GRID_ITEM}>
                    <ProductCardSkeleton />
                  </motion.div>
                ))
              : bestSellers?.map((product) => (
                  <motion.div key={product.id} variants={GRID_ITEM}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ══ Section 7 — Delivery Banner ══════════════════════════════════════ */}
      <DeliveryBanner lang={lang} />

      {/* ══ Section 8 — Testimonials ══════════════════════════════════════════ */}
      <section className="section-luxury bg-cream-200">
        <div className="container-luxury">

          <motion.div
            {...motionProps}
            variants={FADE_UP}
            className="mb-14 text-center"
          >
            <SectionLabel>
              {isAr
                ? 'آراء عملائنا — Avis Clients'
                : 'Avis Clients — آراء عملائنا'}
            </SectionLabel>
            <h2 className="heading-section mt-2">
              {isAr ? 'ما يقوله عملاؤنا' : 'Ce que disent nos clients'}
            </h2>
          </motion.div>

          <motion.div
            {...motionProps}
            variants={STAGGER_GRID}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.article
                key={i}
                variants={GRID_ITEM}
                className="bg-cream-50 border border-cream-300 p-8 flex flex-col gap-6"
              >
                <Stars />

                <blockquote
                  className={[
                    'flex-1 text-ink/80 leading-relaxed',
                    isAr
                      ? 'font-arabic text-base'
                      : 'font-display italic text-lg',
                  ].join(' ')}
                >
                  &ldquo;{isAr ? t.quote_ar : t.quote_fr}&rdquo;
                </blockquote>

                <footer className="border-t border-cream-300 pt-5">
                  <p
                    className={[
                      'font-body font-medium text-ink text-sm',
                      isAr ? 'font-arabic' : '',
                    ].join(' ')}
                  >
                    {isAr ? t.name_ar : t.name_fr}
                  </p>
                  <p className="label-luxury mt-0.5">
                    {isAr ? t.city_ar : t.city_fr}
                  </p>
                </footer>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
