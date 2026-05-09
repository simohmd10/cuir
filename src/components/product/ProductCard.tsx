import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../lib/utils';
import LazyImage from '../ui/LazyImage';
import StarRating from '../ui/StarRating';
import type { Product } from '../../types';

// ─── Shimmer bar helper ───────────────────────────────────────────────────────
function ShimmerBar({ className }: { className: string }) {
  return (
    <div
      className={`rounded-sm bg-cream-200 animate-shimmer ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, #F5EDE0 0%, #FAF7F4 42%, #EDE0CF 58%, #F5EDE0 100%)',
        backgroundSize: '800px 100%',
      }}
    />
  );
}

// ─── ProductCardSkeleton ──────────────────────────────────────────────────────
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex flex-col ${className}`} aria-hidden="true">
      <div
        className="w-full overflow-hidden bg-cream-200 animate-shimmer"
        style={{
          aspectRatio: '3 / 4',
          backgroundImage: 'linear-gradient(90deg, #F5EDE0 0%, #FAF7F4 42%, #EDE0CF 58%, #F5EDE0 100%)',
          backgroundSize: '800px 100%',
        }}
      />
      <div className="pt-3 pb-2 space-y-2.5">
        <ShimmerBar className="h-[14px] w-3/4" />
        <ShimmerBar className="h-[12px] w-5/12" />
        <ShimmerBar className="h-[10px] w-1/3" />
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
const ProductCard: React.FC<{ product: Product; className?: string }> = ({
  product,
  className = '',
}) => {
  const { lang, dir } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const name = lang === 'ar' ? product.name_ar : product.name;
  const badgeLabel = lang === 'ar' ? (product.badge_ar ?? product.badge) : product.badge;
  const image = getImageUrl(product.images?.[0], '/placeholder-bag.jpg');
  const hasVariants = product.colors.length > 1 || product.sizes.length > 1;
  const isLowStock   = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const viewLabel    = lang === 'ar' ? 'عرض المنتج' : 'Voir le produit';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (hasVariants) { navigate(`/product/${product.id}`); return; }
    addItem(product, 1, product.colors[0] ?? '', product.sizes[0] ?? '');
    toast.success(
      lang === 'ar' ? 'تمت الإضافة إلى السلة' : 'Ajouté au panier',
      { description: name, position: 'bottom-center', duration: 2500 }
    );
  };

  return (
    <div className={`group relative flex flex-col ${className}`}>

      {/* ── Image container ────────────────────────────────────────────────── */}
      <Link
        to={`/product/${product.id}`}
        className="relative block overflow-hidden bg-cream-100"
        style={{ aspectRatio: '3 / 4' }}
        aria-label={name}
      >
        {/* Image — CSS scale on hover */}
        <div className="w-full h-full transition-transform duration-[800ms] ease-[var(--ease-luxury)] group-hover:scale-[1.04]">
          <LazyImage src={image} alt={name} className="w-full h-full" />
        </div>

        {/* Badge */}
        {badgeLabel && (
          <div className={['absolute top-3 z-10', dir === 'rtl' ? 'right-3' : 'left-3'].join(' ')}>
            <span className={[
              'inline-block px-2 py-0.5 text-[10px] tracking-luxury uppercase',
              'bg-cream-50/90 text-camel border border-camel/20 backdrop-blur-xs',
              lang === 'ar' ? 'font-arabic tracking-normal text-[11px]' : 'font-body',
            ].join(' ')}>
              {badgeLabel}
            </span>
          </div>
        )}

        {/* "Voir le produit" overlay — CSS opacity on group-hover */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms] ease-[var(--ease-luxury)]"
          style={{ backgroundColor: 'rgba(28,28,28,0.60)' }}
        >
          <span className={[
            'text-cream-50 text-[11px] tracking-luxury uppercase',
            'translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-[var(--ease-luxury)]',
            lang === 'ar' ? 'font-arabic tracking-normal text-sm' : 'font-body',
          ].join(' ')}>
            {viewLabel}
          </span>
        </div>

        {/* Quick-add "+" — desktop only, CSS hover */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            aria-label={lang === 'ar' ? 'أضف للسلة' : 'Ajouter au panier'}
            className={[
              'absolute bottom-3 z-20 hidden md:flex',
              'items-center justify-center w-8 h-8',
              'bg-cream-50 text-ink',
              'hover:bg-camel hover:text-cream-50',
              'transition-all duration-300 ease-[var(--ease-luxury)]',
              'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100',
              dir === 'rtl' ? 'left-3' : 'right-3',
            ].join(' ')}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
      </Link>

      {/* ── Info area ──────────────────────────────────────────────────────── */}
      <Link
        to={`/product/${product.id}`}
        className="flex flex-col gap-1.5 pt-3 pb-1 focus:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        <h3 className={[
          'truncate font-light text-base text-ink leading-snug',
          lang === 'ar' ? 'font-arabic text-right' : 'font-display',
        ].join(' ')}>
          {name}
        </h3>

        <div className={['flex items-baseline gap-2', dir === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row'].join(' ')}>
          <span className="text-sm text-ink font-body tabular-nums">
            {formatPrice(product.price, lang)}
          </span>
          {product.original_price != null && product.original_price > product.price && (
            <span className="text-xs text-ink/40 font-body line-through tabular-nums">
              {formatPrice(product.original_price, lang)}
            </span>
          )}
        </div>

        <div className={['flex items-center gap-2', dir === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row'].join(' ')}>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={product.rating} size="sm" />
              <span className="text-[11px] text-ink/50 font-body tabular-nums">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
          {isLowStock && (
            <span className={[
              'text-[10px] text-camel',
              lang === 'ar' ? 'font-arabic tracking-normal' : 'font-body uppercase tracking-luxury',
            ].join(' ')}>
              {lang === 'ar' ? 'كمية محدودة' : 'Stock limité'}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
