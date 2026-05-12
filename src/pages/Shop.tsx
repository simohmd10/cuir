import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X, ChevronDown, Check } from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { usePageMeta } from '../hooks/usePageMeta';
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
  { value: 'newest',     ar: 'الأحدث',              fr: 'Plus récent'    },
  { value: 'price_asc',  ar: 'السعر: الأقل أولاً',  fr: 'Prix croissant' },
  { value: 'price_desc', ar: 'السعر: الأعلى أولاً', fr: 'Prix décroissant'},
  { value: 'rating',     ar: 'الأعلى تقييماً',      fr: 'Mieux noté'     },
];

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ lang }: { lang: string }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-8 py-28 text-center">
      <div className="w-14 h-14 border border-camel/30 flex items-center justify-center" aria-hidden="true">
        <span className="text-xl text-camel font-display font-light leading-none">—</span>
      </div>
      <div className="space-y-2.5 max-w-xs">
        <p className={classNames('font-light text-xl text-ink', lang === 'ar' ? 'font-arabic' : 'font-display')}>
          {lang === 'ar' ? 'لا توجد منتجات' : 'Aucun produit trouvé'}
        </p>
        <p className="text-xs tracking-luxury uppercase text-ink/35 font-body">
          {lang === 'ar'
            ? 'جرّب تعديل الفلاتر أو البحث بكلمات أخرى'
            : 'Modifiez les filtres ou la recherche'}
        </p>
      </div>
      <Link to="/shop" className="btn-ghost text-xs">
        {lang === 'ar' ? 'عرض جميع المنتجات' : 'Voir toute la collection'}
      </Link>
    </div>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────

interface SortDropdownProps {
  value: SortValue;
  onChange: (v: SortValue) => void;
  lang: string;
  dir: 'rtl' | 'ltr';
}

function SortDropdown({ value, onChange, lang, dir }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          'flex items-center gap-2.5 px-4 py-3 border border-cream-400',
          'text-xs tracking-luxury uppercase font-body text-ink',
          'bg-cream-100 hover:border-camel/60 transition-colors duration-300',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-camel',
          'min-w-[11.5rem] whitespace-nowrap'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={lang === 'ar' ? 'ترتيب حسب' : 'Trier par'}
      >
        <span className="flex-1 text-start">{lang === 'ar' ? current.ar : current.fr}</span>
        <ChevronDown
          className={classNames(
            'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 text-ink/40',
            open ? 'rotate-180' : ''
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* CSS-animated dropdown — no framer-motion */}
      <ul
        role="listbox"
        className={classNames(
          'absolute z-40 mt-px w-full bg-cream-100 border border-cream-300 shadow-sm py-1',
          'transition-all duration-200 origin-top',
          dir === 'rtl' ? 'right-0' : 'left-0',
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        )}
        style={{ transformOrigin: 'top' }}
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
                  : 'text-ink/50 hover:text-ink hover:bg-cream-200/60'
              )}
            >
              {lang === 'ar' ? opt.ar : opt.fr}
              {opt.value === value && <Check className="w-3 h-3 flex-shrink-0 text-camel" strokeWidth={2} />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Category pill skeleton ───────────────────────────────────────────────────

function PillSkeleton() {
  return (
    <div
      className="flex-none h-9 w-20 skeleton"
      style={{
        backgroundImage: 'linear-gradient(90deg, #F4F2EC 0%, #FAFAF7 40%, #ECEAE5 60%, #F4F2EC 100%)',
        backgroundSize: '200% 100%',
      }}
      aria-hidden="true"
    />
  );
}

// ─── Shop page ────────────────────────────────────────────────────────────────

export default function Shop() {
  const { lang, dir } = useLanguage();
  usePageMeta(
    lang === 'ar' ? 'المتجر | كوير — حقائب وإكسسوارات جلدية' : 'Boutique | Cuir — Sacs & Accessoires en Cuir',
    lang === 'ar'
      ? 'تصفح مجموعتنا من الحقائب والإكسسوارات الجلدية الفاخرة، مصنوعة يدويًا في المغرب.'
      : 'Parcourez notre collection de maroquinerie de luxe — sacs, porte-cartes et accessoires en cuir naturel.',
  );
  const [searchParams, setSearchParams] = useSearchParams();

  // ── URL-synced state ──────────────────────────────────────────────────────
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam   = searchParams.get('search')   || '';
  const sortParam     = (searchParams.get('sort') as SortValue) || 'newest';

  const [searchInput, setSearchInput] = useState(searchParam);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [visiblePages, setVisiblePages] = useState(1);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { setSearchInput(searchParam); }, [searchParam]);
  useEffect(() => { setVisiblePages(1); }, [categoryParam, searchParam, sortParam]);
  useEffect(() => {
    document.title = lang === 'ar' ? 'المتجر — Cuir' : 'Boutique — Cuir';
  }, [lang]);

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: categories, isLoading: catLoading } = useCategories();

  // When a parent category is selected, also include its children so products
  // assigned to sub-categories still appear in the parent listing.
  const categoryFilter = (() => {
    if (!categoryParam || categoryParam === 'all') return undefined;
    const children = (categories ?? [])
      .filter((c) => c.parent_slug === categoryParam)
      .map((c) => c.slug);
    return children.length > 0 ? [categoryParam, ...children] : undefined;
  })();

  const { data: products, isLoading: productsLoading } = useProducts({
    ...(categoryFilter
      ? { categories: categoryFilter }
      : categoryParam && categoryParam !== 'all'
        ? { category: categoryParam }
        : {}),
    search: searchParam || undefined,
    sortBy: sortParam,
  });

  // ── URL helpers ───────────────────────────────────────────────────────────
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
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
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
  const isLoading       = productsLoading || catLoading;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white" dir={dir}>

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <header className="bg-white py-16 md:py-20">
        <div className="container-luxury text-center space-y-4">
          <p className="section-label">
            {lang === 'ar' ? '— المتجر —' : '— Boutique —'}
          </p>
          <h1 className="heading-section text-balance">
            {lang === 'ar' ? 'جميع التصاميم' : 'Toute la Collection'}
          </h1>
          {!productsLoading && (
            <p className="text-[11px] tracking-luxury uppercase font-body text-ink/35 tabular-nums">
              {lang === 'ar'
                ? `عرض ${totalCount} منتجاً`
                : `${totalCount} pièce${totalCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </header>

      {/* ── Sticky Filter Bar ──────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b border-black/10"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="container-luxury py-3.5 space-y-3">

          {/* Category pills */}
          <div
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5"
            role="group"
            aria-label={lang === 'ar' ? 'الفئات' : 'Catégories'}
          >
            <button
              onClick={() => setCategory('all')}
              className={classNames(
                'flex-none px-4 py-2 text-xs tracking-luxury uppercase font-body',
                'transition-colors duration-300 whitespace-nowrap focus:outline-none',
                'focus-visible:ring-1 focus-visible:ring-camel',
                categoryParam === 'all'
                  ? 'bg-ink text-cream-100'
                  : 'border border-cream-400 text-ink/50 hover:border-ink/60 hover:text-ink'
              )}
              aria-pressed={categoryParam === 'all'}
            >
              {lang === 'ar' ? 'الكل' : 'Tout'}
            </button>

            {catLoading
              ? Array.from({ length: 4 }).map((_, i) => <PillSkeleton key={i} />)
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
                        : 'border border-cream-400 text-ink/50 hover:border-ink/60 hover:text-ink'
                    )}
                    aria-pressed={categoryParam === cat.slug}
                  >
                    {lang === 'ar' ? cat.name_ar : cat.name}
                  </button>
                ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                className={classNames(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-ink/25 pointer-events-none',
                  dir === 'rtl' ? 'right-3.5' : 'left-3.5'
                )}
                strokeWidth={1.5}
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث عن حقيبة...' : 'Rechercher...'}
                className={classNames(
                  'input-luxury w-full py-3',
                  dir === 'rtl' ? 'pr-10 pl-9' : 'pl-10 pr-9'
                )}
                aria-label={lang === 'ar' ? 'بحث عن منتج' : 'Rechercher un produit'}
              />
              {/* CSS-only clear button — no AnimatePresence */}
              <button
                onClick={clearSearch}
                aria-label={lang === 'ar' ? 'مسح البحث' : 'Effacer la recherche'}
                className={classNames(
                  'absolute top-1/2 -translate-y-1/2 text-ink/25 hover:text-ink/60',
                  'transition-all duration-200 p-0.5',
                  dir === 'rtl' ? 'left-3.5' : 'right-3.5',
                  searchInput ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                tabIndex={searchInput ? 0 : -1}
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
            <SortDropdown value={sortParam} onChange={setSort} lang={lang} dir={dir} />
          </div>

          {/* Count on mobile */}
          {!isLoading && (
            <p className="text-[10px] tracking-luxury uppercase text-ink/25 font-body sm:hidden tabular-nums">
              {lang === 'ar'
                ? `${totalCount} منتج`
                : `${totalCount} produit${totalCount !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Products Grid ──────────────────────────────────────────────────── */}
      <main className="container-luxury py-12 md:py-16">

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>

        ) : totalCount === 0 ? (
          <div className="grid grid-cols-1"><EmptyState lang={lang} /></div>

        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <div className="w-px h-8 bg-cream-400" aria-hidden="true" />
                <button onClick={() => setVisiblePages((p) => p + 1)} className="btn-ghost">
                  {lang === 'ar' ? `تحميل المزيد — ${remaining}` : `Voir plus — ${remaining}`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
