import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../lib/utils';
import LazyImage from '../ui/LazyImage';
import StarRating from '../ui/StarRating';
import type { Product } from '../../types';

// ─── Easing ──────────────────────────────────────────────────────────────────
const EASE_LUXURY = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  className?: string;
}

// ─── Shimmer bar helper ───────────────────────────────────────────────────────
function ShimmerBar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-sm bg-cream-200 animate-shimmer ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, #F5EDE0 0%, #FAF7F4 42%, #EDE0CF 58%, #F5EDE0 100%)',
        backgroundSize: '800px 100%',
      }}
    />
  );
}

// ─── ProductCardSkeleton ──────────────────────────────────────────────────────
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col ${className}`} aria-hidden="true">
      {/* Image placeholder — 3/4 ratio */}
      <div
        className="w-full overflow-hidden bg-cream-200 animate-shimmer"
        style={{
          aspectRatio: '3 / 4',
          backgroundImage:
            'linear-gradient(90deg, #F5EDE0 0%, #FAF7F4 42%, #EDE0CF 58%, #F5EDE0 100%)',
          backgroundSize: '800px 100%',
        }}
      />
      {/* Info */}
      <div className="pt-3 pb-2 space-y-2.5">
        <ShimmerBar className="h-[14px] w-3/4" />
        <ShimmerBar className="h-[12px] w-5/12" />
        <ShimmerBar className="h-[10px] w-1/3" />
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { lang, dir } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────
  const name = lang === 'ar' ? product.name_ar : product.name;
  const badgeLabel =
    lang === 'ar'
      ? (product.badge_ar ?? product.badge)
      : product.badge;

  const image = getImageUrl(product.images?.[0], '/placeholder-bag.jpg');

  // A product "has variants" if it offers more than one choice in either dimension.
  const hasVariants = product.colors.length > 1 || product.sizes.length > 1;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    // Navigate to product page so user can pick variants
    if (hasVariants) {
      navigate(`/product/${product.id}`);
      return;
    }

    const color = product.colors[0] ?? '';
    const size = product.sizes[0] ?? '';
    addItem(product, 1, color, size);

    toast.success(
      lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier',
      {
        description: name,
        position: 'bottom-center',
        duration: 2500,
      }
    );
  };

  const viewLabel = lang === 'ar' ? 'عرض المنتج' : 'Voir le produit';

  return (
    <div
      className={`group relative flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image container ────────────────────────────────────────────────── */}
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden bg-cream-100"
        style={{ aspectRatio: '3 / 4' }}
        aria-label={name}
        tabIndex={0}
      >
        {/* Luxury scale on hover */}
        <motion.div
          className="w-full h-full"
          animate={{ scale: isHovered ? 1.04 : 1 }}
          transition={{ duration: 0.8, ease: EASE_LUXURY }}
        >
          <LazyImage src={image} alt={name} className="w-full h-full" />
        </motion.div>

        {/* Badge — top-start corner */}
        {badgeLabel && (
          <div
            className={[
              'absolute top-3 z-10',
              dir === 'rtl' ? 'right-3' : 'left-3',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block px-2 py-0.5 text-[10px] tracking-luxury uppercase',
                'bg-cream-50/90 text-camel border border-camel/20 backdrop-blur-xs',
                lang === 'ar' ? 'font-arabic tracking-normal text-[11px]' : 'font-body',
              ].join(' ')}
            >
              {badgeLabel}
            </span>
          </div>
        )}

        {/* "Voir le produit" overlay on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(28,28,28,0.60)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_LUXURY }}
            >
              <motion.span
                className={[
                  'text-cream-50 text-[11px] tracking-luxury uppercase',
                  lang === 'ar'
                    ? 'font-arabic tracking-normal text-sm'
                    : 'font-body',
                ].join(' ')}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 4, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_LUXURY, delay: 0.06 }}
              >
                {viewLabel}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick-add "+" — bottom-end corner, desktop only */}
        {!isOutOfStock && (
          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={handleQuickAdd}
                aria-label={lang === 'ar' ? 'أضف للسلة' : 'Ajouter au panier'}
                className={[
                  'absolute bottom-3 z-20 hidden md:flex',
                  'items-center justify-center w-8 h-8',
                  'bg-cream-50 text-ink',
                  'hover:bg-camel hover:text-cream-50',
                  'transition-colors duration-300 ease-luxury',
                  dir === 'rtl' ? 'left-3' : 'right-3',
                ].join(' ')}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.22, ease: EASE_LUXURY }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </Link>

      {/* ── Info area ──────────────────────────────────────────────────────── */}
      <Link
        to={`/product/${product.id}`}
        className="flex flex-col gap-1.5 pt-3 pb-1 focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* Product name */}
        <h3
          className={[
            'truncate font-light text-base text-ink leading-snug',
            lang === 'ar' ? 'font-arabic text-right' : 'font-display',
          ].join(' ')}
        >
          {name}
        </h3>

        {/* Price row */}
        <div
          className={[
            'flex items-baseline gap-2',
            dir === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row',
          ].join(' ')}
        >
          <span className="text-sm text-ink font-body tabular-nums">
            {formatPrice(product.price, lang)}
          </span>
          {product.original_price != null &&
            product.original_price > product.price && (
              <span className="text-xs text-ink/40 font-body line-through tabular-nums">
                {formatPrice(product.original_price, lang)}
              </span>
            )}
        </div>

        {/* Stars + low-stock indicator */}
        <div
          className={[
            'flex items-center gap-2',
            dir === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row',
          ].join(' ')}
        >
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-[11px] text-ink/50 font-body tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}

          {isLowStock && (
            <span
              className={[
                'text-[10px] text-camel',
                lang === 'ar'
                  ? 'font-arabic tracking-normal'
                  : 'font-body uppercase tracking-luxury',
              ].join(' ')}
            >
              {lang === 'ar' ? 'كمية محدودة' : 'Stock limité'}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
