import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Gift, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { useCart, DELIVERY_FEE_THRESHOLD } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../lib/utils';
import { useProducts } from '../hooks/useProducts';
import LazyImage from '../components/ui/LazyImage';
import ProductCard from '../components/product/ProductCard';

const DELIVERY_FEE = 30;

const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Cart() {
  const { t, lang, dir } = useLanguage();
  usePageMeta(lang === 'ar' ? 'السلة | كوير' : 'Panier | Cuir');
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();
  const { data: suggestedProducts } = useProducts({ limit: 4 });

  const deliveryFee = subtotal >= DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const amountToFreeDelivery = DELIVERY_FEE_THRESHOLD - subtotal;

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-beige-50" dir={dir}>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-28 h-28 rounded-full bg-beige-100 flex items-center justify-center">
              <ShoppingBag className="w-14 h-14 text-leather-300" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-leather-800 mb-2">
                {t('cartEmpty')}
              </h1>
              <p className="text-leather-500 text-lg">{t('cartEmptyMsg')}</p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-ink text-white px-8 py-3.5 rounded-full font-semibold hover:bg-ink/80 transition-colors duration-200 shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              {t('continueShopping')}
            </Link>
          </motion.div>
        </div>

        {/* Suggested products even on empty cart */}
        {suggestedProducts && suggestedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-display font-bold text-leather-800 mb-6 text-center">
              {t('youMightLike')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page title */}
        <motion.h1
          className="text-3xl md:text-4xl font-display font-bold text-leather-800 mb-8 text-center"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {lang === 'ar' ? 'سلتك' : 'Votre Panier'}
        </motion.h1>

        {/* ── Free delivery banner ── */}
        <AnimatePresence mode="wait">
          {amountToFreeDelivery > 0 ? (
            <motion.div
              key="threshold"
              className="mb-6 bg-gradient-to-r from-gold-300/30 to-gold-500/20 border border-gold-400 rounded-2xl p-4 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <Gift className="w-5 h-5 text-gold-600 flex-shrink-0" />
              <p className="text-leather-700 font-medium text-sm">
                {lang === 'ar'
                  ? `أضف ${formatPrice(amountToFreeDelivery, lang)} للحصول على توصيل مجاني`
                  : `Ajoutez ${formatPrice(amountToFreeDelivery, lang)} pour la livraison gratuite`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="free"
              className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <Gift className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-emerald-700 font-medium text-sm">
                {lang === 'ar'
                  ? 'مبروك! تحصل على توصيل مجاني'
                  : 'Félicitations ! Livraison gratuite offerte'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart items — 2/3 width ── */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Header */}
              <div className="p-5 border-b border-beige-100 flex items-center gap-3">
                <Package className="w-5 h-5 text-leather-500" />
                <h2 className="font-semibold text-leather-700">
                  {lang === 'ar'
                    ? `${items.length} منتج${items.length > 1 ? '' : ''} في سلتك`
                    : `${items.length} article${items.length > 1 ? 's' : ''} dans votre panier`}
                </h2>
              </div>

              {/* Items */}
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const name = item.product.name;
                  const image = getImageUrl(item.product.images?.[0], '');
                  const itemTotal = item.product.price * item.quantity;

                  return (
                    <motion.div
                      key={`${item.product.id}-${item.color}-${item.size}`}
                      layout
                      initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: dir === 'rtl' ? -30 : 30, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.25 }}
                      className="flex items-start gap-4 p-5 border-b border-beige-50 last:border-0"
                    >
                      {/* Image */}
                      <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                        <LazyImage
                          src={image}
                          alt={name}
                          className="w-20 h-20 rounded-xl"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-semibold text-leather-800 hover:text-leather-600 transition-colors line-clamp-2 leading-snug text-sm"
                        >
                          {name}
                        </Link>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.color && (
                            <span className="text-xs text-leather-500 bg-beige-100 px-2 py-0.5 rounded-full">
                              {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-xs text-leather-500 bg-beige-100 px-2 py-0.5 rounded-full">
                              {item.size}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-leather-600 mt-1.5 text-sm">
                          {formatPrice(item.product.price, lang)}
                        </p>
                      </div>

                      {/* Quantity & actions */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Quantity stepper */}
                        <div className="flex items-center gap-1 bg-beige-50 rounded-full px-1 py-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.color, item.size, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-leather-100 transition-colors text-leather-600"
                            aria-label="Diminuer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-leather-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.color, item.size, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-leather-100 transition-colors text-leather-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Augmenter"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item total */}
                        <p className="text-sm font-bold text-leather-700">
                          {formatPrice(itemTotal, lang)}
                        </p>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.product.id, item.color, item.size)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={t('remove')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Continue shopping */}
            <div className="mt-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-leather-500 hover:text-leather-700 font-medium transition-colors text-sm"
              >
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {t('continueShopping')}
              </Link>
            </div>
          </div>

          {/* ── Order summary — 1/3 width ── */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-2xl shadow-sm p-6 sticky top-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <h2 className="text-xl font-bold text-leather-800 mb-5">{t('orderSummary')}</h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-leather-600">{t('subtotal')}</span>
                  <span className="font-semibold text-leather-800">{formatPrice(subtotal, lang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-leather-600">{t('deliveryFee')}</span>
                  {deliveryFee === 0 ? (
                    <span className="font-semibold text-emerald-600">{t('free')}</span>
                  ) : (
                    <span className="font-semibold text-leather-800">{formatPrice(deliveryFee, lang)}</span>
                  )}
                </div>
                <div className="border-t border-beige-100 pt-3 flex justify-between">
                  <span className="font-bold text-leather-800 text-base">{t('total')}</span>
                  <span className="font-bold text-xl text-leather-600">{formatPrice(total, lang)}</span>
                </div>
              </div>

              <motion.button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-ink text-white rounded-xl font-bold text-base hover:bg-ink/80 transition-colors duration-200 flex items-center justify-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                {t('checkout')}
                <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </motion.button>

              <p className="text-xs text-center text-leather-400 mt-3">
                {lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── You might like ── */}
        {suggestedProducts && suggestedProducts.length > 0 && (
          <motion.section
            className="mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <h2 className="text-2xl font-display font-bold text-leather-800 mb-6 text-center">
              {t('youMightLike')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.slice(0, 4).map((product) => (
                <motion.div key={product.id} variants={slideUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
