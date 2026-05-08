import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, PackageOpen } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { classNames } from '../lib/utils';
import ProductCard from '../components/product/ProductCard';

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'rating';

interface SortOption {
  value: SortValue;
  labelKey: 'newest' | 'priceAsc' | 'priceDesc' | 'ratingDesc';
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', labelKey: 'newest' },
  { value: 'price_asc', labelKey: 'priceAsc' },
  { value: 'price_desc', labelKey: 'priceDesc' },
  { value: 'rating', labelKey: 'ratingDesc' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
      <div className="aspect-[3/4] bg-leather-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-leather-100 rounded w-1/3" />
        <div className="h-4 bg-leather-100 rounded w-2/3" />
        <div className="h-4 bg-leather-100 rounded w-1/2" />
        <div className="h-8 bg-leather-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ lang }: { lang: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center gap-5 py-20 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-leather-100 flex items-center justify-center">
        <PackageOpen className="w-12 h-12 text-leather-300" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-leather-800 mb-1">
          {lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit trouvé'}
        </h3>
        <p className="text-leather-500 text-sm">
          {lang === 'ar'
            ? 'جرب تغيير الفلاتر أو البحث بكلمات مختلفة'
            : 'Essayez de modifier les filtres ou de chercher avec d\'autres termes'}
        </p>
      </div>
      <Link
        to="/shop"
        className="px-6 py-2.5 bg-leather-500 text-white rounded-full text-sm font-semibold hover:bg-leather-600 transition-colors"
      >
        {lang === 'ar' ? 'عرض جميع المنتجات' : 'Voir tous les produits'}
      </Link>
    </motion.div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────

export default function Shop() {
  const { t, lang, dir } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced filter state ───────────────────────────────────────────────
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const sortParam = (searchParams.get('sort') as SortValue) || 'newest';

  // Local search input (debounced before syncing to URL)
  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Visible page count (for load-more)
  const [visiblePages, setVisiblePages] = useState(1);

  // ── Sync searchParam → searchInput when URL changes externally ───────────
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // ── Reset visible pages when filters change ───────────────────────────────
  useEffect(() => {
    setVisiblePages(1);
  }, [categoryParam, searchParam, sortParam]);

  // ── SEO ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title =
      lang === 'ar' ? 'المتجر – Cuir' : 'Boutique – Cuir';
  }, [lang]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products, isLoading: productsLoading } = useProducts({
    category: categoryParam === 'all' ? undefined : categoryParam,
    search: searchParam || undefined,
    sortBy: sortParam,
  });

  // ── Filter helpers ────────────────────────────────────────────────────────
  const setCategory = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(searchParams);
      if (slug === 'all') {
        next.delete('category');
      } else {
        next.set('category', slug);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setSort = useCallback(
    (value: SortValue) => {
      const next = new URLSearchParams(searchParams);
      next.set('sort', value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (value.trim()) {
        next.set('search', value.trim());
      } else {
        next.delete('search');
      }
      setSearchParams(next, { replace: true });
    }, 350);
  };

  const clearSearch = () => {
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next, { replace: true });
  };

  // ── Pagination logic ──────────────────────────────────────────────────────
  const allProducts = products ?? [];
  const totalCount = allProducts.length;
  const visibleProducts = allProducts.slice(0, visiblePages * PAGE_SIZE);
  const hasMore = visibleProducts.length < totalCount;

  const isLoading = productsLoading || catLoading;

  // ── Active category label ─────────────────────────────────────────────────
  const activeCat = categories?.find((c) => c.slug === categoryParam);

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      {/* ── Page Header ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-white border-b border-leather-100 py-8 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-leather-800">
            {activeCat
              ? lang === 'ar'
                ? activeCat.name_ar
                : activeCat.name
              : t('shop')}
          </h1>
          {!productsLoading && (
            <p className="mt-1 text-leather-500 text-sm">
              {lang === 'ar'
                ? `عرض ${totalCount} منتج`
                : `${totalCount} produit${totalCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Filters Bar ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideUp}
          className="mb-6 space-y-4"
        >
          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400 pointer-events-none" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Rechercher un produit...'}
                className={classNames(
                  'w-full h-10 bg-white border border-leather-200 rounded-xl text-sm text-leather-800 placeholder:text-leather-400',
                  'focus:outline-none focus:ring-2 focus:ring-leather-300 focus:border-transparent transition',
                  dir === 'rtl' ? 'pr-9 pl-8' : 'pl-9 pr-8'
                )}
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-leather-400 hover:text-leather-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-leather-400 flex-shrink-0" />
              <select
                value={sortParam}
                onChange={(e) => setSort(e.target.value as SortValue)}
                className="h-10 bg-white border border-leather-200 rounded-xl text-sm text-leather-700 px-3 focus:outline-none focus:ring-2 focus:ring-leather-300 transition appearance-none cursor-pointer pe-7"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={classNames(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                categoryParam === 'all'
                  ? 'bg-leather-500 text-white border-leather-500 shadow-sm'
                  : 'bg-white text-leather-600 border-leather-200 hover:border-leather-400'
              )}
            >
              {t('allCategories')}
            </button>
            {catLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 rounded-full bg-leather-100 animate-pulse" />
                ))
              : categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={classNames(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                      categoryParam === cat.slug
                        ? 'bg-leather-500 text-white border-leather-500 shadow-sm'
                        : 'bg-white text-leather-600 border-leather-200 hover:border-leather-400'
                    )}
                  >
                    {lang === 'ar' ? cat.name_ar : cat.name}
                  </button>
                ))}
          </div>
        </motion.div>

        {/* ── Products Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <EmptyState lang={lang} />
        ) : (
          <>
            <motion.div
              key={`${categoryParam}-${searchParam}-${sortParam}`}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {visibleProducts.map((product) => (
                <motion.div key={product.id} variants={slideUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {/* ── Load More ── */}
            {hasMore && (
              <div className="mt-10 text-center">
                <motion.button
                  onClick={() => setVisiblePages((p) => p + 1)}
                  className="px-8 py-3 bg-white border-2 border-leather-300 text-leather-700 font-semibold rounded-full hover:bg-leather-500 hover:text-white hover:border-leather-500 transition-all duration-200 text-sm"
                  whileTap={{ scale: 0.97 }}
                >
                  {lang === 'ar'
                    ? `عرض المزيد (${totalCount - visibleProducts.length})`
                    : `Voir plus (${totalCount - visibleProducts.length})`}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
