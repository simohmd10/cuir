import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, X, ChevronDown, Check } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { classNames } from '../lib/utils';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 400;

// ─── Types ────────────────────────────────────────────────────────────────────

type SortValue = 'newest' | 'price_asc' | 'price_desc' | 'rating';

interface SortOption {
  value: SortValue;
  ar: string;
  fr: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest',    ar: 'الأحدث',             fr: 'Plus récent'   },
  { value: 'price_asc', ar: 'السعر: الأقل أولاً', fr: 'Prix croissant' },
  { value: 'price_desc',ar: 'السعر: الأعلى أولاً',fr: 'Prix décroissant'},
  { value: 'rating',    ar: 'الأعلى تقييماً',     fr: 'Mieux noté'    },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const EASE_LUXURY = [0.25, 0.46, 0.45, 0.94] as const;

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: EASE_LUXURY } },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_LUXURY } },
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ lang }: { lang: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-6 py-24 text-center">
      <div
        className="w-16 h-16 border border-cream-400 flex items-center justify-center"
        aria-hidden="true"
      >
        <span className="text-2xl text-camel font-display font-light">∅</span>
      </div>
      <div className="space-y-2">
        <p
          className={classNames(
            'text-ink font-light text-lg',
            lang === 'ar' ? 'font-arabic' : 'font-display'
          )}
        >
          {lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit trouvé'}
        </p>
        <p className="text-ink/40 text-sm font-body">
          {lang === 'ar'
            ? 'جرّب تعديل الفلاتر أو البحث بكلمات أخرى'
            : 'Essayez de modifier les filtres ou la recherche'}
        </p>
      </div>
      <Link to="/shop" className="btn-ghost text-xs">
        {lang === 'ar' ? 'عرض جميع المنتجات' : 'Voir tous les produits'}
      </Link>
    </div>
  );
}

// ─── Custom sort dropdown ─────────────────────────────────────────────────────

interface SortDropdownProps {
  value: SortValue;
  onChange: (v: SortValue) => void;
  lang: string;
}

function SortDropdown({ value, onChange, lang }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          'flex items-center gap-2 px-4 py-2.5 border border-cream-400',
          'text-xs tracking-luxury uppercase font-body text-ink',
          'bg-cream-100 hover:border-ink transition-colors duration-300',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-camel',
          'min-w-[11rem]'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex-1 text-start">
          {lang === 'ar' ? current.ar : current.fr}
        </span>
        <ChevronDown
          className={classNames(
            'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300',
            open ? 'rotate-180' : ''
          )}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE_LUXURY }}
            role="listbox"
            className={classNames(
              'absolute z-30 mt-1 w-full bg-cream-100 border border-cream-400',
              'shadow-sm py-1'
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={classNames(
                    'w-full flex items-center justify-between gap-3 px-4 py-2.5',
                    'text-xs tracking-luxury uppercase font-body text-start',
                    'transition-colors duration-200',
                    opt.value === value
                      ? 'text-ink bg-cream-200'
                      : 'text-ink/60 hover:text-ink hover:bg-cream-200'
                  )}
                >
                  {lang === 'ar' ? opt.ar : opt.fr}
                  {opt.value === value && (
                    <Check className="w-3 h-3 flex-shrink-0 text-camel" strokeWidth={2} />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────

export default function Shop() {
  const { lang, dir } = useLanguage();
  const prefersReduced = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced state ──────────────────────────────────────────────────────
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam   = searchParams.get('search') || '';
  const sortParam     = (searchParams.get('sort') as SortValue) || 'newest';

  // Local search input — debounced before URL write
  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load-more page counter
  const [visiblePages, setVisiblePages] = useState(1);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { setSearchInput(searchParam); }, [searchParam]);
  useEffect(() => { setVisiblePages(1); }, [categoryParam, searchParam, sortParam]);

  useEffect(() => {
    document.title = lang === 'ar' ? 'المتجر – Cuir' : 'Boutique – Cuir';
  }, [lang]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: products,   isLoading: productsLoading } = useProducts({
    category: categoryParam === 'all' ? undefined : categoryParam,
    search:   searchParam || undefined,
    sortBy:   sortParam,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setCategory = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(searchParams);
      slug === 'all' ? next.delete('category') : next.set('category', slug);
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
      value.trim() ? next.set('search', value.trim()) : next.delete('search');
      setSearchParams(next, { replace: true });
    }, DEBOUNCE_MS);
  };

  const clearSearch = () => {
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next, { replace: true });
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const allProducts     = products ?? [];
  const totalCount      = allProducts.length;
  const visibleProducts = allProducts.slice(0, visiblePages * PAGE_SIZE);
  const hasMore         = visibleProducts.length < totalCount;
  const remaining       = totalCount - visibleProducts.length;

  const isLoading = productsLoading || catLoading;

  // ── Motion props — disabled when prefers-reduced-motion ──────────────────
  const motionProps = prefersReduced
    ? {}
    : { initial: 'hidden', animate: 'visible', variants: fadeVariants };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-100" dir={dir}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <motion.div
        {...(prefersReduced ? {} : { initial: 'hidden', animate: 'visible', variants: fadeVariants })}
        className="bg-cream-200 py-16"
      >
        <div className="container-luxury text-center space-y-3">
          <p className="section-label">
            {lang === 'ar' ? '— المتجر' : 'Boutique —'}
          </p>
          <h1 className="heading-section">
            {lang === 'ar' ? 'جميع التصاميم' : 'Toute la Collection'}
          </h1>
          {!productsLoading && (
            <p className="text-xs tracking-luxury uppercase font-body text-ink/40">
              {lang === 'ar'
                ? `عرض ${totalCount} منتجاً`
                : `${totalCount} pièce${totalCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Sticky Filter Bar ────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 bg-cream-100/95 backdrop-blur-sm border-b border-cream-300"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <div className="container-luxury py-4 space-y-3">

          {/* Row 1: Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            {/* "All" pill */}
            <button
              onClick={() => setCategory('all')}
              className={classNames(
                'flex-none px-4 py-2 text-xs tracking-luxury uppercase font-body',
                'transition-colors duration-300 whitespace-nowrap focus:outline-none',
                'focus-visible:ring-1 focus-visible:ring-camel',
                categoryParam === 'all'
                  ? 'bg-ink text-cream-100'
                  : 'border border-cream-400 text-ink/60 hover:border-ink hover:text-ink'
              )}
            >
              {lang === 'ar' ? 'الكل' : 'Tout'}
            </button>

            {catLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-none h-9 w-20 skeleton"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #F5EDE0 0%, #FAF7F4 40%, #EDE0CF 60%, #F5EDE0 100%)',
                      backgroundSize: '200% 100%',
                    }}
                  />
                ))
              : categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={classNames(
                      'flex-none px-4 py-2 text-xs tracking-luxury uppercase font-body',
                      'transition-colors duration-300 whitespace-nowrap focus:outline-none',
                      'focus-visible:ring-1 focus-visible:ring-camel',
                      categoryParam === cat.slug
                        ? 'bg-ink text-cream-100'
                        : 'border border-cream-400 text-ink/60 hover:border-ink hover:text-ink'
                    )}
                  >
                    {lang === 'ar' ? cat.name_ar : cat.name}
                  </button>
                ))}
          </div>

          {/* Row 2: Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className={classNames(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none',
                  dir === 'rtl' ? 'right-4' : 'left-4'
                )}
                strokeWidth={1.5}
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={
                  lang === 'ar' ? 'ابحث عن حقيبة...' : 'Rechercher...'
                }
                className={classNames(
                  'input-luxury w-full',
                  dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'
                )}
                aria-label={lang === 'ar' ? 'بحث' : 'Rechercher'}
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className={classNames(
                    'absolute top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors',
                    dir === 'rtl' ? 'left-4' : 'right-4'
                  )}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <SortDropdown value={sortParam} onChange={setSort} lang={lang} />
          </div>

          {/* Row 3: Product count (mobile) */}
          {!isLoading && (
            <p className="text-[11px] tracking-luxury uppercase text-ink/30 font-body sm:hidden">
              {lang === 'ar'
                ? `${totalCount} منتج`
                : `${totalCount} produit${totalCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Products Grid ────────────────────────────────────────────────── */}
      <div className="container-luxury py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="grid grid-cols-1">
            <EmptyState lang={lang} />
          </div>
        ) : (
          <>
            <motion.div
              key={`${categoryParam}-${searchParam}-${sortParam}`}
              {...(prefersReduced
                ? {}
                : { initial: 'hidden', animate: 'visible', variants: gridVariants })}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {visibleProducts.map((product) =>
                prefersReduced ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <motion.div key={product.id} variants={cardVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                )
              )}
            </motion.div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-14 flex justify-center">
                <button
                  onClick={() => setVisiblePages((p) => p + 1)}
                  className="btn-ghost"
                >
                  {lang === 'ar'
                    ? `تحميل المزيد (${remaining})`
                    : `Voir plus (${remaining})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
