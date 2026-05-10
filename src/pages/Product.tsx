import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useProduct, useProducts, useCategories } from '../hooks/useProducts';
import { useReviews, useSubmitReview } from '../hooks/useReviews';
import { formatPrice, getImageUrl, classNames, formatDate } from '../lib/utils';
import LazyImage from '../components/ui/LazyImage';
import StarRating from '../components/ui/StarRating';
import ProductCard, { ProductCardSkeleton } from '../components/product/ProductCard';
import type { Review } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps stored color names (French/Arabic/English/hex) to a CSS color value.
 * Returns undefined when no mapping exists → render as a text pill instead.
 */
const COLOR_MAP: Record<string, string> = {
  // Neutrals
  noir:        '#1C1C1C',
  black:       '#1C1C1C',
  أسود:        '#1C1C1C',
  blanc:       '#F5F0E8',
  white:       '#F5F0E8',
  أبيض:        '#F5F0E8',
  ivoire:      '#FFFFF0',
  crème:       '#FAF7F4',
  creme:       '#FAF7F4',
  gris:        '#9E9E9E',
  grey:        '#9E9E9E',
  gray:        '#9E9E9E',
  رمادي:       '#9E9E9E',
  // Browns & leather tones
  marron:      '#6B4423',
  brun:        '#6B4423',
  brown:       '#6B4423',
  بني:         '#6B4423',
  camel:       '#C4A882',
  كاميل:       '#C4A882',
  cognac:      '#9B4319',
  كونياك:      '#9B4319',
  havane:      '#8B5A2B',
  chocolat:    '#4A2810',
  tabac:       '#8B6914',
  sable:       '#C2A572',
  tan:         '#C8A96E',
  fauve:       '#B5651D',
  // Reds
  rouge:       '#C0392B',
  red:         '#C0392B',
  أحمر:        '#C0392B',
  bordeaux:    '#722F37',
  burgundy:    '#722F37',
  // Blues
  marine:      '#1C2E4A',
  bleu:        '#2B5797',
  blue:        '#2B5797',
  أزرق:        '#2B5797',
  navy:        '#1C2E4A',
  cobalt:      '#0047AB',
  // Greens
  vert:        '#2D6A4F',
  green:       '#2D6A4F',
  أخضر:        '#2D6A4F',
  kaki:        '#8B864E',
  khaki:       '#8B864E',
  olive:       '#6B6B2A',
  // Metallics
  or:          '#B8965A',
  gold:        '#B8965A',
  ذهبي:        '#B8965A',
  bronze:      '#8B6914',
  argent:      '#A8A9AD',
  silver:      '#A8A9AD',
  // Pinks & Purples
  rose:        '#F48FB1',
  pink:        '#F48FB1',
  vieux_rose:  '#C9837A',
  prune:       '#7B3F5E',
  // Yellows
  miel:        '#D4A017',
  honey:       '#D4A017',
};

/** Returns a CSS color value for a product color name, or undefined if none. */
function resolveColor(name: string): string | undefined {
  // Direct hex value
  if (/^#[0-9a-fA-F]{3,8}$/.test(name)) return name;
  // Named CSS color from map (case-insensitive, accent-insensitive)
  const key = name.toLowerCase().replace(/[éèêëàâùûîïôç]/g, (c) =>
    ({ é:'e',è:'e',ê:'e',ë:'e',à:'a',â:'a',ù:'u',û:'u',î:'i',ï:'i',ô:'o',ç:'c' })[c] ?? c
  );
  return COLOR_MAP[key];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton({ dir }: { dir: 'rtl' | 'ltr' }) {
  return (
    <div className="min-h-screen bg-cream-100" dir={dir}>
      <div className="container-luxury py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8 lg:gap-16">

          {/* Image col */}
          <div className="space-y-3">
            <div
              className="w-full bg-cream-200 skeleton"
              style={{ aspectRatio: '3 / 4' }}
            />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-cream-200 skeleton flex-none" />
              ))}
            </div>
          </div>

          {/* Info col */}
          <div className="space-y-5 pt-2">
            <div className="h-3 bg-cream-200 skeleton w-20" />
            <div className="h-10 bg-cream-200 skeleton w-4/5" />
            <div className="h-4 bg-cream-200 skeleton w-32" />
            <div className="h-8 bg-cream-200 skeleton w-36" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-cream-200 skeleton w-full" />
              <div className="h-3 bg-cream-200 skeleton w-11/12" />
              <div className="h-3 bg-cream-200 skeleton w-3/4" />
            </div>
            <div className="h-12 bg-cream-200 skeleton w-full mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Accordion item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  lang: string;
}

function AccordionItem({ title, children, defaultOpen = false, lang }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-cream-300 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={classNames(
          'w-full flex items-center justify-between gap-4 py-4',
          'text-start focus:outline-none focus-visible:ring-1 focus-visible:ring-camel'
        )}
        aria-expanded={open}
      >
        <span
          className={classNames(
            'text-xs tracking-luxury uppercase font-body text-ink/70',
            lang === 'ar' ? 'font-arabic tracking-normal text-sm' : ''
          )}
        >
          {title}
        </span>
        <ChevronDown
          className={classNames(
            'w-3.5 h-3.5 text-ink/30 flex-shrink-0 transition-transform duration-400',
            open ? 'rotate-180' : ''
          )}
          strokeWidth={1.5}
          style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
        />
      </button>

      {/* Height animation via max-height */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height,opacity] duration-500"
        style={{
          maxHeight: open ? (contentRef.current?.scrollHeight ?? 400) + 'px' : '0px',
          opacity: open ? 1 : 0,
          transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      >
        <div className="pb-5 text-sm text-ink/55 font-body leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

function ReviewCard({ review, lang }: { review: Review; lang: string }) {
  return (
    <article className="py-6 border-b border-cream-300 last:border-b-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          {/* Initial avatar */}
          <div
            className="w-8 h-8 flex-none bg-camel/10 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-xs font-body text-camel uppercase">
              {review.user_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="text-xs font-body text-ink font-medium">
              {review.user_name}
            </p>
            <p className="text-[10px] tracking-luxury uppercase text-ink/30 font-body mt-0.5">
              {formatDate(review.created_at, lang === 'ar' ? 'ar' : 'fr')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.comment && (
        <p
          className={classNames(
            'text-sm text-ink/60 leading-relaxed',
            lang === 'ar'
              ? 'font-arabic font-light'
              : 'font-display font-light italic'
          )}
        >
          {review.comment}
        </p>
      )}
    </article>
  );
}

// ─── Rating bar row ───────────────────────────────────────────────────────────

function RatingBar({ star, pct, count }: { star: number; pct: number; count: number }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-body text-ink/40">
      <span className="w-2 text-end tabular-nums">{star}</span>
      <div className="flex-1 h-px bg-cream-400 relative overflow-hidden">
        <div
          className="absolute inset-y-0 start-0 bg-camel transition-[width] duration-700 ease-[var(--ease-luxury)]"
          style={{ height: '1px', width: `${pct}%` }}
        />
      </div>
      <span className="w-4 tabular-nums">{count}</span>
    </div>
  );
}

// ─── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({ productId, lang }: { productId: string; lang: string }) {
  const { mutate: submitReview, isPending } = useSubmitReview();
  const [name, setName]       = useState('');
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || !comment.trim()) {
      toast.error(
        lang === 'ar' ? 'يرجى تعبئة جميع الحقول' : 'Veuillez remplir tous les champs'
      );
      return;
    }
    submitReview(
      { product_id: productId, user_name: name.trim(), rating, comment: comment.trim() },
      {
        onSuccess: () => {
          setSubmitted(true);
          setName(''); setRating(0); setComment('');
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="py-8 text-center animate-[heroFadeIn_0.6s_var(--ease-luxury)_both]">
        <p className="section-label mb-2">
          {lang === 'ar' ? 'شكراً لك' : 'Merci'}
        </p>
        <p className="text-sm text-ink/50 font-body">
          {lang === 'ar'
            ? 'تم إرسال تقييمك وسيظهر بعد المراجعة'
            : 'Votre avis a été soumis et sera publié après validation'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="label-luxury block">
          {lang === 'ar' ? 'الاسم' : 'Votre nom'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Entrez votre nom'}
          className="input-luxury"
          required
        />
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="label-luxury block">
          {lang === 'ar' ? 'التقييم' : 'Votre note'}
        </label>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <label className="label-luxury block">
          {lang === 'ar' ? 'التعليق' : 'Votre commentaire'}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            lang === 'ar'
              ? 'شاركنا تجربتك مع هذه الحقيبة...'
              : 'Partagez votre expérience avec ce sac...'
          }
          rows={4}
          className="input-luxury resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending || rating === 0}
        className="btn-ghost w-full"
      >
        {isPending
          ? (lang === 'ar' ? 'جاري الإرسال...' : 'Envoi en cours...')
          : (lang === 'ar' ? 'إرسال التقييم' : 'Soumettre l\'avis')}
      </button>
    </form>
  );
}

// ─── Mobile image carousel (Embla) ───────────────────────────────────────────

interface MobileCarouselProps {
  images: string[];
  productName: string;
  selectedIndex: number;
  onSelect: (i: number) => void;
  dir: 'rtl' | 'ltr';
}

function MobileCarousel({ images, productName, selectedIndex, onSelect, dir }: MobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ direction: dir, loop: false });

  // Sync external selectedIndex → embla
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(selectedIndex, false);
  }, [emblaApi, selectedIndex]);

  // Sync embla scroll → parent
  useEffect(() => {
    if (!emblaApi) return;
    const onSettle = () => onSelect(emblaApi.selectedScrollSnap());
    emblaApi.on('settle', onSettle);
    return () => { emblaApi.off('settle', onSettle); };
  }, [emblaApi, onSelect]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((img, i) => (
          <div key={i} className="flex-none w-full" style={{ aspectRatio: '3 / 4' }}>
            <LazyImage
              src={getImageUrl(img)}
              alt={`${productName} ${i + 1}`}
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product page ─────────────────────────────────────────────────────────────

export default function ProductPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const { lang, dir } = useLanguage();
  const { addItem } = useCart();
  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: product, isLoading, isError } = useProduct(id ?? '');
  const { data: reviews }        = useReviews(id ?? '');
  const { data: allCategories }  = useCategories();
  const { data: relatedRaw }     = useProducts({
    category: product?.category,
    limit: 5,
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize,  setSelectedSize]  = useState('');
  const [quantity,      setQuantity]      = useState(1);
  const [activeImage,   setActiveImage]   = useState(0);
  const [addingToCart,  setAddingToCart]  = useState(false);

  // Thumbnail embla (desktop)
  const [thumbRef] = useEmblaCarousel({
    axis: 'x',
    dragFree: true,
    containScroll: 'keepSnaps',
    direction: dir,
  });

  // ── Derived values ────────────────────────────────────────────────────────
  const images        = product?.images ?? [];
  const productName   = product ? (lang === 'ar' ? product.name_ar : product.name) : '';
  const productDesc   = product ? (lang === 'ar' ? product.description_ar : product.description) : '';
  const isOutOfStock  = product ? product.stock === 0 : false;
  const isLowStock    = product ? product.stock > 0 && product.stock <= 5 : false;
  const hasDiscount   = product?.original_price != null && product.original_price > product.price;
  const discountPct   = hasDiscount && product
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  const approvedReviews = reviews ?? [];
  const reviewCount     = approvedReviews.length > 0
    ? approvedReviews.length
    : product?.review_count ?? 0;
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
    : product?.rating ?? 0;

  const related = relatedRaw?.filter((p) => p.id !== id).slice(0, 4) ?? [];

  // Resolve category display name from the categories list
  const categoryName = product?.category
    ? (allCategories?.find((c) => c.slug === product.category)
        ?.[lang === 'ar' ? 'name_ar' : 'name']
      ?? product.category)
    : null;

  const hasColors = (product?.colors.length ?? 0) > 0;
  const hasSizes  = (product?.sizes.length ?? 0) > 0;

  const canAddToCart =
    !!product &&
    !isOutOfStock &&
    !(hasColors && !selectedColor) &&
    !(hasSizes  && !selectedSize);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] ?? '');
      setSelectedSize(product.sizes[0]  ?? '');
      setQuantity(1);
      setActiveImage(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  useEffect(() => {
    if (product) {
      document.title = `${productName} — Cuir`;
    }
  }, [product, lang]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(async () => {
    if (!product || !canAddToCart) return;
    setAddingToCart(true);
    try {
      addItem(product, quantity, selectedColor, selectedSize);
      toast.success(
        lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier',
        { description: productName, position: 'bottom-center', duration: 2500 }
      );
    } finally {
      setAddingToCart(false);
    }
  }, [product, canAddToCart, addItem, quantity, selectedColor, selectedSize, lang, productName]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;
    const msg = encodeURIComponent(
      lang === 'ar'
        ? `شاهد هذا المنتج الرائع: ${productName}\n${window.location.href}`
        : `Découvrez ce produit: ${productName}\n${window.location.href}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank', 'noopener');
  }, [product, productName, lang]);

  const goImagePrev = () => setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const goImageNext = () => setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));

  // ── Error / not found ─────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4" dir={dir}>
        <div className="text-center max-w-sm space-y-6">
          <div className="w-12 h-12 border border-camel/30 flex items-center justify-center mx-auto" aria-hidden="true">
            <span className="text-camel font-display font-light text-lg">—</span>
          </div>
          <div className="space-y-2">
            <h1 className={classNames(
              'font-light text-2xl text-ink',
              lang === 'ar' ? 'font-arabic' : 'font-display'
            )}>
              {lang === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable'}
            </h1>
            <p className="text-xs tracking-luxury uppercase text-ink/35 font-body">
              {lang === 'ar'
                ? 'عذراً، لا يمكن العثور على هذا المنتج'
                : 'Ce produit est introuvable'}
            </p>
          </div>
          <Link to="/shop" className="btn-ghost inline-flex">
            {lang === 'ar' ? 'العودة للمتجر' : 'Retour à la boutique'}
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !product) {
    return <ProductSkeleton dir={dir} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-100" dir={dir}>

      {/* ══════════════════════════════════════════════
          PART 1 — Product Hero
      ══════════════════════════════════════════════ */}
      <section className="container-luxury py-10 md:py-16">

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-2 mb-8 md:mb-12 text-[11px] tracking-luxury uppercase font-body text-ink/30"
          aria-label="breadcrumb"
        >
          <Link to="/" className="hover:text-camel transition-colors duration-300">
            {lang === 'ar' ? 'الرئيسية' : 'Accueil'}
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/shop" className="hover:text-camel transition-colors duration-300">
            {lang === 'ar' ? 'المتجر' : 'Boutique'}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink/60 line-clamp-1">{productName}</span>
        </nav>

        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-8 lg:gap-16">

          {/* ── LEFT: Image gallery ── */}
          <div>
            {/* Mobile carousel */}
            <div className="block md:hidden">
              <div className="relative" style={{ aspectRatio: '3 / 4' }}>
                <MobileCarousel
                  images={images}
                  productName={productName}
                  selectedIndex={activeImage}
                  onSelect={setActiveImage}
                  dir={dir}
                />
                {/* Dot indicators */}
                {images.length > 1 && (
                  <div
                    className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5"
                    aria-hidden="true"
                  >
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={classNames(
                          'w-1 h-1 rounded-full transition-all duration-300',
                          i === activeImage ? 'bg-cream-100 w-4' : 'bg-cream-100/40'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop: main image + thumbnail strip */}
            <div className="hidden md:block space-y-3">

              {/* Main image */}
              <div
                className="relative overflow-hidden bg-cream-200 select-none"
                style={{ aspectRatio: '3 / 4' }}
              >
                <div key={activeImage} className="w-full h-full animate-[heroFadeIn_0.3s_var(--ease-luxury)_both]">
                  <LazyImage
                    src={getImageUrl(images[activeImage] ?? '')}
                    alt={productName}
                    className="w-full h-full"
                  />
                </div>

                {/* Discount badge */}
                {hasDiscount && (
                  <div
                    className={classNames(
                      'absolute top-4 z-10',
                      dir === 'rtl' ? 'right-4' : 'left-4'
                    )}
                  >
                    <span className="inline-block px-2 py-0.5 text-[10px] tracking-luxury uppercase font-body bg-camel-100 text-camel">
                      -{discountPct}%
                    </span>
                  </div>
                )}

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goImagePrev}
                      aria-label={lang === 'ar' ? 'الصورة السابقة' : 'Image précédente'}
                      className={classNames(
                        'absolute top-1/2 -translate-y-1/2 z-10',
                        'w-9 h-9 flex items-center justify-center',
                        'bg-cream-100/80 text-ink hover:bg-cream-100 transition-colors duration-300',
                        dir === 'rtl' ? 'right-3' : 'left-3'
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={goImageNext}
                      aria-label={lang === 'ar' ? 'الصورة التالية' : 'Image suivante'}
                      className={classNames(
                        'absolute top-1/2 -translate-y-1/2 z-10',
                        'w-9 h-9 flex items-center justify-center',
                        'bg-cream-100/80 text-ink hover:bg-cream-100 transition-colors duration-300',
                        dir === 'rtl' ? 'left-3' : 'right-3'
                      )}
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div ref={thumbRef} className="overflow-hidden">
                  <div className="flex gap-2">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        aria-label={`${lang === 'ar' ? 'صورة' : 'Image'} ${i + 1}`}
                        aria-pressed={i === activeImage}
                        className={classNames(
                          'flex-none w-20 h-20 overflow-hidden bg-cream-200',
                          'transition-all duration-300 border-2',
                          i === activeImage
                            ? 'border-camel'
                            : 'border-transparent opacity-55 hover:opacity-80'
                        )}
                      >
                        <LazyImage
                          src={getImageUrl(img)}
                          alt={`${productName} ${i + 1}`}
                          className="w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Product info (sticky desktop) ── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">

            {/* Category label */}
            {categoryName && (
              <Link
                to={`/shop?category=${product.category}`}
                className="section-label hover:text-camel/80 transition-colors"
              >
                {categoryName}
              </Link>
            )}

            {/* Product name */}
            <h1
              className={classNames(
                'font-light text-3xl md:text-4xl leading-snug text-ink',
                lang === 'ar' ? 'font-arabic' : 'font-display'
              )}
            >
              {productName}
            </h1>

            {/* Rating row */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2.5">
                <StarRating rating={avgRating} size="sm" />
                <span className="text-[11px] tracking-luxury uppercase font-body text-ink/40 tabular-nums">
                  {avgRating.toFixed(1)}{' '}
                  ({reviewCount}{' '}
                  {lang === 'ar' ? 'تقييم' : reviewCount === 1 ? 'avis' : 'avis'})
                </span>
              </div>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-body text-ink tabular-nums">
                {formatPrice(product.price, lang)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-ink/35 font-body line-through tabular-nums">
                    {formatPrice(product.original_price!, lang)}
                  </span>
                  <span className="text-[10px] tracking-luxury uppercase font-body bg-camel-100 text-camel px-2 py-0.5">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <p className="text-[11px] tracking-luxury uppercase font-body">
              {isOutOfStock ? (
                <span className="text-red-400">
                  {lang === 'ar' ? 'نفذ من المخزون | Épuisé' : 'Épuisé | نفذ'}
                </span>
              ) : isLowStock ? (
                <span className="text-amber-500">
                  {lang === 'ar'
                    ? `آخر ${product.stock} قطع | Dernières ${product.stock} pièces`
                    : `Dernières ${product.stock} pièces | آخر ${product.stock} قطع`}
                </span>
              ) : (
                <span className="text-emerald-600">
                  {lang === 'ar' ? 'متوفر | En stock' : 'En stock | متوفر'}
                </span>
              )}
            </p>

            {/* Divider */}
            <div className="h-px bg-cream-300" aria-hidden="true" />

            {/* Color selector */}
            {hasColors && (
              <div className="space-y-2.5">
                <p className="label-luxury">
                  {lang === 'ar' ? 'اللون' : 'Couleur'}{' '}
                  {selectedColor && (
                    <span className="text-ink/60 normal-case tracking-normal">
                      — {selectedColor}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    const cssColor   = resolveColor(color);

                    return cssColor ? (
                      /* Colored circle swatch */
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={color}
                        aria-pressed={isSelected}
                        className={classNames(
                          'w-9 h-9 rounded-full flex-shrink-0 transition-all duration-300',
                          'border-2',
                          isSelected
                            ? 'border-camel ring-2 ring-camel ring-offset-2 ring-offset-cream-100'
                            : 'border-cream-300 hover:border-camel/60'
                        )}
                        style={{ backgroundColor: cssColor }}
                      />
                    ) : (
                      /* Text pill for unmapped names */
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        aria-pressed={isSelected}
                        className={classNames(
                          'px-3 py-1.5 text-xs tracking-luxury uppercase font-body',
                          'border transition-colors duration-300',
                          isSelected
                            ? 'bg-ink text-cream-100 border-ink'
                            : 'border-cream-400 text-ink/60 hover:border-ink/60 hover:text-ink'
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {hasSizes && (
              <div className="space-y-2.5">
                <p className="label-luxury">
                  {lang === 'ar' ? 'المقاس / Taille' : 'Taille / المقاس'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={isSelected}
                        className={classNames(
                          'px-3.5 py-1.5 text-xs tracking-luxury uppercase font-body',
                          'border transition-colors duration-300',
                          isSelected
                            ? 'bg-ink text-cream-100 border-ink'
                            : 'border-cream-400 text-ink/60 hover:border-ink/60 hover:text-ink'
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity stepper */}
            <div className="space-y-2.5">
              <p className="label-luxury">
                {lang === 'ar' ? 'الكمية' : 'Quantité'}
              </p>
              <div className="flex items-center gap-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label={lang === 'ar' ? 'تقليل الكمية' : 'Diminuer la quantité'}
                  className="w-10 h-10 flex items-center justify-center border-b border-cream-400 text-ink/40 hover:text-ink transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
                <span
                  className="w-12 text-center text-sm font-body text-ink tabular-nums border-b border-cream-400 h-10 flex items-center justify-center"
                  aria-live="polite"
                  aria-label={`${lang === 'ar' ? 'الكمية' : 'Quantité'}: ${quantity}`}
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  aria-label={lang === 'ar' ? 'زيادة الكمية' : 'Augmenter la quantité'}
                  className="w-10 h-10 flex items-center justify-center border-b border-cream-400 text-ink/40 hover:text-ink transition-colors duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Add to cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAddToCart || addingToCart}
              className="btn-luxury w-full gap-3"
              aria-label={
                isOutOfStock
                  ? (lang === 'ar' ? 'نفذ من المخزون' : 'Épuisé')
                  : (lang === 'ar' ? 'أضف إلى السلة' : 'Ajouter au panier')
              }
            >
              <ShoppingBag className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              {addingToCart
                ? (lang === 'ar' ? '...' : '...')
                : isOutOfStock
                  ? (lang === 'ar' ? 'نفذ من المخزون' : 'Épuisé')
                  : (lang === 'ar' ? 'أضف إلى السلة' : 'Ajouter au panier')}
            </button>

            {/* WhatsApp share */}
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex items-center gap-2 text-xs tracking-luxury uppercase font-body text-camel hover:text-camel/70 transition-colors duration-300"
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              {lang === 'ar' ? 'شارك على واتساب' : 'Partager sur WhatsApp'}
            </button>

            {/* Accordion sections */}
            <div className="border-t border-cream-300 pt-1">
              <AccordionItem
                title={lang === 'ar' ? 'الوصف / Description' : 'Description / الوصف'}
                defaultOpen
                lang={lang}
              >
                {productDesc
                  ? <p className="whitespace-pre-line">{productDesc}</p>
                  : <p className="italic text-ink/30">
                      {lang === 'ar' ? 'لا يوجد وصف' : 'Aucune description'}
                    </p>
                }
              </AccordionItem>

              <AccordionItem
                title={lang === 'ar' ? 'التفاصيل / Matériaux' : 'Matériaux / التفاصيل'}
                lang={lang}
              >
                <ul className="space-y-1">
                  <li>{lang === 'ar' ? 'جلد مغربي أصيل' : 'Cuir marocain authentique'}</li>
                  <li>{lang === 'ar' ? 'حواف مخيطة يدوياً' : 'Coutures faites à la main'}</li>
                  <li>{lang === 'ar' ? 'بطانة داخلية قماشية' : 'Doublure intérieure en tissu'}</li>
                </ul>
              </AccordionItem>

              <AccordionItem
                title={lang === 'ar' ? 'الشحن والتوصيل / Livraison' : 'Livraison / الشحن'}
                lang={lang}
              >
                <p>
                  {lang === 'ar'
                    ? '2–5 أيام عمل في المغرب / 2–5 jours ouvrés au Maroc'
                    : '2–5 jours ouvrés au Maroc / 2–5 أيام عمل في المغرب'}
                </p>
              </AccordionItem>

              <AccordionItem
                title={lang === 'ar' ? 'الإرجاع / Retours' : 'Retours / الإرجاع'}
                lang={lang}
              >
                <p>
                  {lang === 'ar'
                    ? '7 أيام من تاريخ الاستلام / 7 jours à compter de la réception'
                    : '7 jours à compter de la réception / 7 أيام من تاريخ الاستلام'}
                </p>
              </AccordionItem>
            </div>

          </div>
          {/* end right column */}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PART 2 — Reviews
      ══════════════════════════════════════════════ */}
      <section className="bg-cream-200 py-16 md:py-24" aria-label={lang === 'ar' ? 'التقييمات' : 'Avis'}>
        <div className="container-luxury">

          {/* Section heading */}
          <div className="mb-12 space-y-2">
            <p className="section-label">
              {lang === 'ar' ? '— التقييمات' : '— Avis Clients'}
            </p>
            <h2
              className={classNames(
                'font-light text-3xl text-ink',
                lang === 'ar' ? 'font-arabic' : 'font-display'
              )}
            >
              {lang === 'ar' ? 'تقييمات العملاء' : 'Avis Clients'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20">

            {/* Rating summary */}
            {approvedReviews.length > 0 && (
              <div className="space-y-6">
                {/* Big number */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-display font-light text-ink tabular-nums leading-none">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-[11px] tracking-luxury uppercase text-ink/30 font-body">
                      / 5
                    </span>
                  </div>
                  <StarRating rating={avgRating} size="md" />
                  <p className="text-[11px] tracking-luxury uppercase text-ink/35 font-body tabular-nums">
                    {reviewCount} {lang === 'ar' ? 'تقييم' : (reviewCount === 1 ? 'avis' : 'avis')}
                  </p>
                </div>

                {/* Bar chart */}
                <div className="space-y-2.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = approvedReviews.filter((r) => Math.round(r.rating) === star).length;
                    const pct   = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
                    return <RatingBar key={star} star={star} pct={pct} count={count} />;
                  })}
                </div>
              </div>
            )}

            {/* Reviews list + form */}
            <div>
              {approvedReviews.length === 0 ? (
                <p className="text-xs tracking-luxury uppercase text-ink/30 font-body py-4">
                  {lang === 'ar'
                    ? 'لا توجد تقييمات بعد — كن الأول'
                    : 'Aucun avis pour l\'instant — soyez le premier'}
                </p>
              ) : (
                <div className="mb-12">
                  {approvedReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} lang={lang} />
                  ))}
                </div>
              )}

              {/* Write a review */}
              <div className="border-t border-cream-300 pt-8">
                <p className="section-label mb-6">
                  {lang === 'ar' ? '— اكتب تقييماً' : '— Laisser un avis'}
                </p>
                <ReviewForm productId={product.id} lang={lang} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PART 3 — Related products
      ══════════════════════════════════════════════ */}
      {(related.length > 0 || isLoading) && (
        <section className="section-luxury" aria-label={lang === 'ar' ? 'منتجات مشابهة' : 'Suggestions'}>
          <div className="container-luxury">

            <div className="mb-10 space-y-2">
              <p className="section-label">
                {lang === 'ar' ? '— قد يعجبك أيضاً | Suggestions' : '— Suggestions | قد يعجبك'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
            </div>

          </div>
        </section>
      )}

    </div>
  );
}

