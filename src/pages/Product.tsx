import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  Share2,
  Minus,
  Plus,
  ArrowLeft,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useProduct, useProducts } from '../hooks/useProducts';
import { useReviews, useSubmitReview } from '../hooks/useReviews';
import { formatPrice, getImageUrl, classNames } from '../lib/utils';
import LazyImage from '../components/ui/LazyImage';
import StarRating from '../components/ui/StarRating';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/product/ProductCard';
import type { Review } from '../types';

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
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 bg-leather-100 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image skeleton */}
        <div className="space-y-3">
          <div className="aspect-square bg-leather-100 rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-leather-100 rounded-xl" />
            ))}
          </div>
        </div>
        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="h-3 bg-leather-100 rounded w-24" />
          <div className="h-7 bg-leather-100 rounded w-3/4" />
          <div className="h-5 bg-leather-100 rounded w-32" />
          <div className="h-8 bg-leather-100 rounded w-28" />
          <div className="h-24 bg-leather-100 rounded" />
          <div className="h-12 bg-leather-100 rounded-xl" />
          <div className="h-12 bg-leather-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-beige-50 rounded-xl p-4 border border-leather-100">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-leather-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {review.user_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-leather-800 text-sm">{review.user_name}</span>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="text-leather-600 text-sm leading-relaxed">{review.comment}</p>
      <p className="text-xs text-leather-400 mt-2">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({ productId }: { productId: string }) {
  const { t, lang } = useLanguage();
  const { mutate: submitReview, isPending } = useSubmitReview();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || rating === 0 || !comment.trim()) {
      toast.error(lang === 'ar' ? 'يرجى تعبئة جميع الحقول' : 'Veuillez remplir tous les champs');
      return;
    }
    submitReview(
      { product_id: productId, user_name: name.trim(), rating, comment: comment.trim() },
      {
        onSuccess: () => {
          setSubmitted(true);
          setName('');
          setRating(0);
          setComment('');
        },
      }
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center"
      >
        <p className="text-emerald-700 font-semibold text-sm">{t('reviewSubmitted')}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-leather-700 mb-1">{t('yourName')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('yourName')}
          className="w-full px-3 py-2.5 border border-leather-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leather-300 bg-white text-leather-800 placeholder:text-leather-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-leather-700 mb-1">{t('yourRating')}</label>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-leather-700 mb-1">{t('yourComment')}</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('yourComment')}
          rows={4}
          className="w-full px-3 py-2.5 border border-leather-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-leather-300 bg-white text-leather-800 placeholder:text-leather-400 resize-none"
          required
        />
      </div>

      <motion.button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-leather-500 text-white font-semibold rounded-xl hover:bg-leather-600 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        whileTap={{ scale: 0.98 }}
      >
        {isPending
          ? lang === 'ar'
            ? 'جاري الإرسال...'
            : 'Envoi en cours...'
          : t('submitReview')}
      </motion.button>
    </form>
  );
}

// ─── Product Page ─────────────────────────────────────────────────────────────

type Tab = 'description' | 'reviews';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, lang, dir } = useLanguage();
  const { addItem } = useCart();

  // ── Product data ──────────────────────────────────────────────────────────
  const { data: product, isLoading, isError } = useProduct(id ?? '');
  const { data: reviews } = useReviews(id ?? '');
  const { data: relatedProducts } = useProducts({
    category: product?.category,
    limit: 5,
  });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // ── Embla carousel for thumbnails ─────────────────────────────────────────
  const [thumbRef, thumbApi] = useEmblaCarousel({
    axis: 'x',
    dragFree: true,
    containScroll: 'keepSnaps',
    direction: dir,
  });

  // ── Initialize selections when product loads ──────────────────────────────
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] ?? '');
      setSelectedSize(product.sizes[0] ?? '');
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product]);

  // ── SEO title ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (product) {
      const name = lang === 'ar' ? product.name_ar : product.name;
      document.title = `${name} – Cuir`;
    }
  }, [product, lang]);

  // ── Image navigation ──────────────────────────────────────────────────────
  const images = product?.images ?? [];
  const currentImage = images[activeImageIndex] ?? '';

  const goPrev = () =>
    setActiveImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setActiveImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  // ── Zoom effect ───────────────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // ── Cart actions ──────────────────────────────────────────────────────────
  const canAddToCart = (): boolean => {
    if (!product || product.stock === 0) return false;
    if (product.colors.length > 0 && !selectedColor) return false;
    if (product.sizes.length > 0 && !selectedSize) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!canAddToCart()) {
      toast.error(t('selectColorSize'));
      return;
    }
    addItem(product, quantity, selectedColor, selectedSize);
    toast.success(t('addedToCart'));
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!canAddToCart()) {
      toast.error(t('selectColorSize'));
      return;
    }
    addItem(product, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  // ── WhatsApp share ────────────────────────────────────────────────────────
  const handleWhatsAppShare = () => {
    if (!product) return;
    const name = lang === 'ar' ? product.name_ar : product.name;
    const url = window.location.href;
    const message = encodeURIComponent(
      lang === 'ar'
        ? `شاهد هذا المنتج الرائع: ${name}\n${url}`
        : `Découvrez ce produit: ${name}\n${url}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // ── Related products (exclude self) ──────────────────────────────────────
  const related = relatedProducts?.filter((p) => p.id !== id).slice(0, 4) ?? [];

  // ── Derived product values ────────────────────────────────────────────────
  const productName = product ? (lang === 'ar' ? product.name_ar : product.name) : '';
  const productDesc = product ? (lang === 'ar' ? product.description_ar : product.description) : '';
  const isOutOfStock = product ? product.stock === 0 : false;
  const isLowStock = product ? product.stock > 0 && product.stock <= 5 : false;
  const hasDiscount =
    product?.original_price != null && product.original_price > product.price;
  const discountPct = hasDiscount && product
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const approvedReviews = reviews ?? [];
  const avgRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length
      : product?.rating ?? 0;

  // ── Error / not found ─────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center px-4" dir={dir}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-leather-800 mb-2">
            {lang === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable'}
          </h1>
          <p className="text-leather-500 mb-6 text-sm">
            {lang === 'ar'
              ? 'عذراً، لا يمكن العثور على هذا المنتج'
              : 'Désolé, ce produit est introuvable'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-leather-500 text-white rounded-full font-semibold text-sm hover:bg-leather-600 transition-colors"
          >
            <ArrowLeft className={classNames('w-4 h-4', dir === 'rtl' ? 'rotate-180' : '')} />
            {lang === 'ar' ? 'العودة' : 'Retour'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-beige-50" dir={dir}>
        <ProductSkeleton />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Breadcrumb ── */}
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex items-center gap-2 text-sm text-leather-400 mb-6 flex-wrap"
          aria-label="breadcrumb"
        >
          <Link to="/" className="hover:text-leather-600 transition-colors">
            {t('home')}
          </Link>
          <ChevronRight className={classNames('w-3.5 h-3.5 flex-shrink-0', dir === 'rtl' ? 'rotate-180' : '')} />
          <Link to="/shop" className="hover:text-leather-600 transition-colors">
            {t('shop')}
          </Link>
          <ChevronRight className={classNames('w-3.5 h-3.5 flex-shrink-0', dir === 'rtl' ? 'rotate-180' : '')} />
          <span className="text-leather-700 font-medium line-clamp-1">{productName}</span>
        </motion.nav>

        {/* ── Main Layout ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* ── LEFT: Image Gallery ── */}
          <motion.div variants={slideUp} className="space-y-3">
            {/* Main image */}
            <div
              className={classNames(
                'relative rounded-2xl overflow-hidden bg-white shadow-sm cursor-zoom-in select-none',
              )}
              style={{ aspectRatio: '1/1' }}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  {isZoomed ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${getImageUrl(currentImage)})`,
                        backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                        backgroundSize: '200%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  ) : (
                    <LazyImage
                      src={getImageUrl(currentImage)}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Discount badge on image */}
              {hasDiscount && (
                <div className="absolute top-3 start-3 z-10">
                  <Badge variant="red">-{discountPct}%</Badge>
                </div>
              )}

              {/* Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute start-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className={classNames('w-5 h-5 text-leather-700', dir === 'rtl' ? 'rotate-180' : '')} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-colors z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className={classNames('w-5 h-5 text-leather-700', dir === 'rtl' ? 'rotate-180' : '')} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails carousel */}
            {images.length > 1 && (
              <div ref={thumbRef} className="overflow-hidden">
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={classNames(
                        'flex-none w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-150',
                        i === activeImageIndex
                          ? 'border-leather-500 shadow-md scale-105'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      )}
                      aria-label={`Image ${i + 1}`}
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
          </motion.div>

          {/* ── RIGHT: Product Details ── */}
          <motion.div variants={slideUp} className="flex flex-col gap-4">
            {/* Category badge */}
            {product.category && (
              <div>
                <Link to={`/shop?category=${product.category}`}>
                  <Badge variant="leather">{product.category}</Badge>
                </Link>
              </div>
            )}

            {/* Product name */}
            <h1
              className={classNames(
                'text-2xl md:text-3xl font-bold text-leather-900 leading-tight',
                lang === 'ar' ? 'font-arabic' : 'font-display'
              )}
            >
              {productName}
            </h1>

            {/* Rating + review count */}
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm text-leather-500">
                ({approvedReviews.length > 0 ? approvedReviews.length : product.review_count ?? 0}{' '}
                {t('reviews')})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-leather-600">
                {formatPrice(product.price, lang)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.original_price!, lang)}
                  </span>
                  <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-sm">
              {isOutOfStock ? (
                <span className="font-semibold text-red-500">{t('outOfStock')}</span>
              ) : isLowStock ? (
                <span className="font-semibold text-amber-600">
                  {product.stock} {t('stockLeft')}
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {t('inStock')}
                </span>
              )}
            </div>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-leather-700 mb-2">
                  {t('selectColor')}
                  {selectedColor && (
                    <span className="font-normal text-leather-500 ms-2">{selectedColor}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    // Try to interpret color as a CSS color (hex/name), fall back to text button
                    const isHexOrNamed = /^#[0-9a-f]{3,8}$/i.test(color) || /^[a-z]+$/i.test(color);
                    return isHexOrNamed ? (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={classNames(
                          'w-8 h-8 rounded-full border-2 transition-all duration-150 flex-shrink-0',
                          isSelected
                            ? 'border-leather-600 ring-2 ring-leather-400 ring-offset-1 scale-110'
                            : 'border-gray-200 hover:border-leather-400'
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                        aria-pressed={isSelected}
                      />
                    ) : (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={classNames(
                          'px-3 py-1.5 rounded-lg border text-sm transition-all duration-150',
                          isSelected
                            ? 'bg-leather-500 text-white border-leather-500 font-semibold'
                            : 'bg-white text-leather-700 border-leather-200 hover:border-leather-400'
                        )}
                        aria-pressed={isSelected}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-leather-700 mb-2">{t('selectSize')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={classNames(
                          'px-4 py-1.5 rounded-lg border text-sm font-medium transition-all duration-150 min-w-[3rem] text-center',
                          isSelected
                            ? 'bg-leather-500 text-white border-leather-500 shadow-sm'
                            : 'bg-white text-leather-700 border-leather-200 hover:border-leather-400'
                        )}
                        aria-pressed={isSelected}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div>
              <p className="text-sm font-semibold text-leather-700 mb-2">{t('quantity')}</p>
              <div className="inline-flex items-center gap-1 bg-white border border-leather-200 rounded-xl px-1 py-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-leather-100 transition-colors text-leather-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-leather-800">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-leather-100 transition-colors text-leather-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <motion.button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={classNames(
                  'flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200',
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-leather-500 text-white hover:bg-leather-600 active:scale-98'
                )}
                whileTap={isOutOfStock ? {} : { scale: 0.97 }}
              >
                <ShoppingBag className="w-4 h-4" />
                {isOutOfStock ? t('outOfStock') : t('addToCart')}
              </motion.button>

              {!isOutOfStock && (
                <motion.button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gold-500 text-white hover:bg-gold-600 transition-all duration-200"
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap className="w-4 h-4" />
                  {t('buyNow')}
                </motion.button>
              )}
            </div>

            {/* WhatsApp share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 text-sm text-leather-500 hover:text-leather-700 transition-colors self-start"
            >
              <Share2 className="w-4 h-4" />
              {t('whatsapp')}
            </button>

            {/* Short description preview */}
            {productDesc && (
              <p className="text-sm text-leather-600 leading-relaxed border-t border-leather-100 pt-4 line-clamp-3">
                {productDesc}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* ── Tabs: Description / Reviews ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mt-12"
        >
          {/* Tab buttons */}
          <div className="flex border-b border-leather-200 mb-6">
            {(['description', 'reviews'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={classNames(
                  'px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-leather-500 text-leather-700'
                    : 'border-transparent text-leather-400 hover:text-leather-600'
                )}
              >
                {tab === 'description' ? t('description') : `${t('reviews')} (${approvedReviews.length})`}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'description' ? (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={classNames(
                  'prose prose-sm max-w-none text-leather-700 leading-relaxed',
                  lang === 'ar' ? 'text-right' : 'text-left'
                )}
              >
                {productDesc ? (
                  <p className="whitespace-pre-line">{productDesc}</p>
                ) : (
                  <p className="text-leather-400 italic">
                    {lang === 'ar' ? 'لا يوجد وصف متاح' : 'Aucune description disponible'}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Rating summary */}
                {approvedReviews.length > 0 && (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-leather-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-leather-800">{avgRating.toFixed(1)}</div>
                      <StarRating rating={avgRating} size="sm" />
                      <div className="text-xs text-leather-400 mt-1">
                        {approvedReviews.length} {t('reviews')}
                      </div>
                    </div>
                    {/* Rating distribution */}
                    <div className="flex-1 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = approvedReviews.filter((r) => Math.round(r.rating) === star).length;
                        const pct = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-leather-500 flex-shrink-0">{star}</span>
                            <Star className="w-3 h-3 text-gold-500 fill-gold-500 flex-shrink-0" />
                            <div className="flex-1 h-1.5 bg-leather-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold-500 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-5 text-leather-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reviews list */}
                {approvedReviews.length === 0 ? (
                  <p className="text-leather-400 text-sm text-center py-8">{t('noReviews')}</p>
                ) : (
                  <div className="space-y-3">
                    {approvedReviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}

                {/* Write review form */}
                <div className="bg-white rounded-2xl p-5 border border-leather-100">
                  <h3 className="font-bold text-leather-800 mb-4">{t('writeReview')}</h3>
                  <ReviewForm productId={product.id} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeIn}
            className="mt-16"
          >
            <h2 className="text-2xl font-display font-bold text-leather-800 mb-6">
              {t('relatedProducts')}
            </h2>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {related.map((p) => (
                <motion.div key={p.id} variants={slideUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
