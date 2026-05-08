import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Eye, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { formatPrice, getImageUrl } from '../../lib/utils';
import LazyImage from '../ui/LazyImage';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [wishListed, setWishListed] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const name = lang === 'ar' ? product.name_ar : product.name;
  const image = getImageUrl(product.images?.[0], '');
  const hasOptions = product.colors.length > 1 || product.sizes.length > 1;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (hasOptions && !showQuickAdd) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize(product.sizes[0] || '');
      setShowQuickAdd(true);
      return;
    }

    const color = selectedColor || product.colors[0] || '';
    const size = selectedSize || product.sizes[0] || '';
    addItem(product, 1, color, size);
    setShowQuickAdd(false);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleConfirmAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedColor, selectedSize);
    setShowQuickAdd(false);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const badgeVariantMap: Record<string, 'gold' | 'red' | 'leather' | 'green' | 'blue'> = {
    new: 'gold',
    sale: 'red',
    bestseller: 'leather',
    featured: 'blue',
  };

  const getBadgeVariant = (badge: string) =>
    badgeVariantMap[badge.toLowerCase()] || 'leather';

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image container */}
        <div className="relative" style={{ aspectRatio: '3/4' }}>
          <LazyImage
            src={image}
            alt={name}
            className="w-full h-full"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
            {product.badge && (
              <Badge variant={getBadgeVariant(product.badge)}>
                {product.badge}
              </Badge>
            )}
            {product.is_best_seller && !product.badge && (
              <Badge variant="leather">{t('bestseller')}</Badge>
            )}
            {product.is_featured && !product.badge && !product.is_best_seller && (
              <Badge variant="gold">{t('featured')}</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="red">{t('outOfStock')}</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="gold">{t('lowStock')}</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishListed(!wishListed);
            }}
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
            aria-label={t('addToWishlist')}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${wishListed ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
            />
          </button>

          {/* Quick view icon */}
          <Link
            to={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 end-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
            aria-label={t('quickView')}
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </Link>

          {/* Quick Add overlay */}
          <AnimatePresence>
            {showQuickAdd && (
              <motion.div
                className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col p-4 z-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={(e) => e.preventDefault()}
              >
                <button
                  className="self-end text-gray-400 hover:text-gray-600 mb-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowQuickAdd(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>

                {product.colors.length > 1 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">{t('color')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedColor(color);
                          }}
                          className={[
                            'px-2 py-1 text-xs rounded-md border transition-colors duration-150',
                            selectedColor === color
                              ? 'border-leather-500 bg-leather-50 text-leather-700 font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-leather-300',
                          ].join(' ')}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes.length > 1 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">{t('size')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedSize(size);
                          }}
                          className={[
                            'px-2 py-1 text-xs rounded-md border transition-colors duration-150',
                            selectedSize === size
                              ? 'border-leather-500 bg-leather-50 text-leather-700 font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-leather-300',
                          ].join(' ')}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirmAdd}
                  className="mt-auto w-full py-2 bg-leather-500 text-white text-sm font-semibold rounded-xl hover:bg-leather-600 transition-colors duration-200"
                >
                  {t('addToCart')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product info */}
        <div className="p-4">
          <h3
            className={`font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug ${lang === 'ar' ? 'font-arabic text-right' : 'font-display'}`}
          >
            {name}
          </h3>

          {/* Rating */}
          {(product.rating > 0 || (product.review_count ?? 0) > 0) && (
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={product.rating} size="sm" />
              {product.review_count != null && product.review_count > 0 && (
                <span className="text-xs text-gray-400">({product.review_count})</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-leather-600">
              {formatPrice(product.price, lang)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.original_price, lang)}
              </span>
            )}
            {product.original_price && product.original_price > product.price && (
              <span className="text-xs font-semibold text-red-500">
                -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={[
            'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200',
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : addedFeedback
              ? 'bg-emerald-500 text-white'
              : 'bg-leather-500 text-white hover:bg-leather-600 active:scale-95',
          ].join(' ')}
          whileTap={isOutOfStock ? {} : { scale: 0.97 }}
        >
          {addedFeedback ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('added')}
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              {isOutOfStock ? t('outOfStock') : t('addToCart')}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
