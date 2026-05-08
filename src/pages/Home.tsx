import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Leaf, HandMetal, Banknote, ChevronRight } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getImageUrl } from '../lib/utils';
import BannerCarousel from '../components/BannerCarousel';
import ProductCard from '../components/product/ProductCard';
import LazyImage from '../components/ui/LazyImage';
import StarRating from '../components/ui/StarRating';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Static Testimonials ──────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    name: 'فاطمة الزهراء',
    nameFr: 'Fatima Zahra',
    text: 'حقيبة رائعة بجودة استثنائية! الجلد طبيعي تماماً والخياطة محكمة. سأطلب مجدداً بالتأكيد.',
    textFr: "Sac magnifique d'une qualité exceptionnelle ! Le cuir est entièrement naturel et la couture est impeccable. Je commanderai à nouveau sans hésiter.",
    rating: 5,
    city: 'الدار البيضاء',
    cityFr: 'Casablanca',
  },
  {
    name: 'كريم بنعلي',
    nameFr: 'Karim Benali',
    text: 'التوصيل سريع والتغليف أنيق جداً. المحفظة تفوقت على توقعاتي، صنع يدوي رائع.',
    textFr: "Livraison rapide et emballage très élégant. Le portefeuille a dépassé mes attentes, une fabrication artisanale remarquable.",
    rating: 5,
    city: 'الرباط',
    cityFr: 'Rabat',
  },
  {
    name: 'نادية العمراني',
    nameFr: 'Nadia El Amrani',
    text: 'اشتريت حزام جلدي لزوجي وأعجبه كثيراً. الجودة عالية جداً وتستحق كل درهم.',
    textFr: "J'ai acheté une ceinture en cuir pour mon mari et il l'a adorée. La qualité est très élevée et vaut chaque centime.",
    rating: 4,
    city: 'مراكش',
    cityFr: 'Marrakech',
  },
];

// ─── Feature Bar Item ─────────────────────────────────────────────────────────

function FeatureItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.div
      variants={slideUp}
      className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-start"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-leather-500/10 flex items-center justify-center text-leather-500">
        {icon}
      </div>
      <span className="text-sm font-medium text-leather-700">{label}</span>
    </motion.div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
  viewAllHref,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-leather-800">{title}</h2>
        {subtitle && <p className="mt-1 text-leather-500 text-sm">{subtitle}</p>}
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="flex items-center gap-1 text-sm font-medium text-leather-500 hover:text-leather-700 transition-colors"
        >
          {t('viewAll')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="aspect-square bg-leather-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-leather-100 rounded w-1/3" />
        <div className="h-4 bg-leather-100 rounded w-2/3" />
        <div className="h-4 bg-leather-100 rounded w-1/2" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-leather-100" />
      <div className="p-3">
        <div className="h-4 bg-leather-100 rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { t, lang } = useLanguage();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: featured, isLoading: featuredLoading } = useProducts({ isFeatured: true, limit: 8 });
  const { data: bestSellers, isLoading: bestSellersLoading } = useProducts({ isBestSeller: true, limit: 4 });

  // SEO title
  useEffect(() => {
    document.title = 'Cuir - متجر الحقائب الجلدية الفاخرة';
  }, []);

  const features = [
    { icon: <Truck className="w-5 h-5" />, label: t('freeDelivery') },
    { icon: <Leaf className="w-5 h-5" />, label: t('authenticLeather') },
    { icon: <HandMetal className="w-5 h-5" />, label: t('handmade') },
    { icon: <Banknote className="w-5 h-5" />, label: t('cashOnDelivery') },
  ];

  return (
    <div className="min-h-screen bg-beige-50">
      {/* ── Banner Carousel ── */}
      <BannerCarousel />

      {/* ── Features Bar ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={stagger}
        className="bg-white border-y border-leather-100 py-6"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <FeatureItem key={i} icon={f.icon} label={f.label} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Shop by Category ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="py-14 px-4 max-w-6xl mx-auto"
      >
        <SectionHeading title={t('shopByCategory')} viewAllHref="/shop" />
        <motion.div
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
            : categories?.map((cat) => (
                <motion.div key={cat.id} variants={slideUp}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="group block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <LazyImage
                        src={getImageUrl(cat.image)}
                        alt={lang === 'ar' ? cat.name_ar : cat.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="py-3 px-4 text-center">
                      <p className="font-semibold text-leather-800 text-sm">
                        {lang === 'ar' ? cat.name_ar : cat.name}
                      </p>
                      {cat.product_count !== undefined && (
                        <p className="text-xs text-leather-400 mt-0.5">
                          {cat.product_count} {lang === 'ar' ? 'منتج' : 'produits'}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
        </motion.div>
      </motion.section>

      {/* ── Featured Products ── */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
          >
            <SectionHeading
              title={t('featuredProducts')}
              subtitle={t('featuredSubtitle')}
              viewAllHref="/shop"
            />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {featuredLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} variants={slideUp}>
                    <ProductSkeleton />
                  </motion.div>
                ))
              : featured?.map((product) => (
                  <motion.div key={product.id} variants={slideUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* ── Best Sellers ── */}
      <section className="py-14 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={fadeIn}
        >
          <SectionHeading
            title={t('bestSellers')}
            subtitle={t('bestSellersSubtitle')}
            viewAllHref="/shop"
          />
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {bestSellersLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} variants={slideUp}>
                  <ProductSkeleton />
                </motion.div>
              ))
            : bestSellers?.map((product) => (
                <motion.div key={product.id} variants={slideUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </motion.div>
      </section>

      {/* ── Marketing Banner ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="py-16 px-4"
        style={{ background: 'linear-gradient(135deg, #8B5E3C 0%, #63432a 60%, #4e3421 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <motion.div variants={slideUp}>
            <Truck className="w-12 h-12 text-gold-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white leading-tight">
              {t('freeDelivery')}
            </h2>
            <p className="mt-3 text-white/70 text-base">
              {lang === 'ar'
                ? 'اطلب الآن واستمتع بالتوصيل المجاني إلى باب منزلك'
                : 'Commandez maintenant et profitez de la livraison gratuite à votre porte'}
            </p>
          </motion.div>
          <motion.div variants={slideUp}>
            <Link
              to="/shop"
              className="inline-block mt-4 px-8 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition-colors text-sm shadow-lg"
            >
              {t('heroBtn')}
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Testimonials ── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={fadeIn}
        className="py-14 px-4 max-w-6xl mx-auto"
      >
        <SectionHeading
          title={lang === 'ar' ? 'ما يقوله عملاؤنا' : 'Ce que disent nos clients'}
        />
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div
              key={i}
              variants={slideUp}
              className="bg-white rounded-2xl p-6 shadow-sm border border-leather-100 flex flex-col gap-4"
            >
              <StarRating rating={testimonial.rating} size="sm" />
              <p className="text-leather-700 text-sm leading-relaxed flex-1">
                &ldquo;{lang === 'ar' ? testimonial.text : testimonial.textFr}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-leather-100">
                <div className="w-9 h-9 rounded-full bg-leather-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {(lang === 'ar' ? testimonial.name : testimonial.nameFr).charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-leather-800">
                    {lang === 'ar' ? testimonial.name : testimonial.nameFr}
                  </p>
                  <p className="text-xs text-leather-400">
                    {lang === 'ar' ? testimonial.city : testimonial.cityFr}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
