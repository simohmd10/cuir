import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import {
  User, Phone, Mail, MapPin, MessageSquare, Tag, Banknote,
  CheckCircle, ChevronDown, Loader2, ShieldCheck,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { useCart, DELIVERY_FEE_THRESHOLD } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { formatPrice, getImageUrl, MOROCCAN_CITIES, generateIdempotencyKey } from '../lib/utils';
import LazyImage from '../components/ui/LazyImage';
import type { CheckoutFormData, PlaceOrderResult, Coupon } from '../types';

// ── Zod schema (type-only, messages injected per language at runtime) ─────────

const _typeSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string().optional().or(z.literal('')),
  address: z.string(),
  city: z.string(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof _typeSchema>;

function buildSchema(msgs: {
  nameMin: string; phoneInvalid: string; emailInvalid: string;
  addressMin: string; cityReq: string;
}) {
  return z.object({
    name: z.string().min(2, msgs.nameMin),
    phone: z.string().regex(/^(06|07)\d{8}$/, msgs.phoneInvalid),
    email: z.string().email(msgs.emailInvalid).optional().or(z.literal('')),
    address: z.string().min(5, msgs.addressMin),
    city: z.string().min(1, msgs.cityReq),
    notes: z.string().optional(),
  });
}

const DELIVERY_FEE = 30;

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-leather-700">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-beige-200 bg-white text-leather-800 placeholder-leather-300 focus:outline-none focus:ring-2 focus:ring-leather-400 focus:border-transparent transition text-sm';

// ── Main component ────────────────────────────────────────────────────────────

export default function Checkout() {
  const { t, lang, dir } = useLanguage();
  // Build schema once per language (messages in the active language)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => buildSchema({
    nameMin: t('nameMinError'),
    phoneInvalid: t('phoneFormatError'),
    emailInvalid: t('invalidEmail'),
    addressMin: t('addressMinError'),
    cityReq: t('cityRequiredError'),
  }), [lang]); // rebuild when language changes
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Redirect if empty
  if (items.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  const deliveryFee = subtotal >= DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE;

  // Discount amount
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.round((subtotal * appliedCoupon.discount_value) / 100)
      : appliedCoupon.discount_value
    : 0;

  const total = subtotal - discountAmount + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // ── Coupon validation ──────────────────────────────────────────────────────

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.trim().toUpperCase())
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .lte('min_order_amount', subtotal)
        .maybeSingle();

      if (error || !data) {
        setCouponError(t('couponInvalid'));
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data as Coupon);
        toast.success(t('couponApplied'));
      }
    } catch {
      setCouponError(t('couponInvalid'));
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place order mutation ───────────────────────────────────────────────────

  const placeOrderMutation = useMutation<PlaceOrderResult, Error, FormData>({
    mutationFn: async (data) => {
      const idempotencyKey = generateIdempotencyKey();

      const { data: result, error } = await supabase.rpc('place_order', {
        p_items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
          color: i.color,
          size: i.size,
        })),
        p_customer_name: data.name,
        p_customer_phone: data.phone,
        p_customer_email: data.email || '',
        p_customer_address: data.address,
        p_customer_city: data.city,
        p_notes: data.notes || '',
        p_coupon_code: appliedCoupon?.code || '',
        p_payment_method: 'cod',
        p_idempotency_key: idempotencyKey,
      });

      if (error) throw new Error(error.message);
      return result as PlaceOrderResult;
    },
    onSuccess: (result) => {
      // Save to sessionStorage with 90-min expiry
      const expiry = Date.now() + 90 * 60 * 1000;
      sessionStorage.setItem(
        `order_${result.order_ref}`,
        JSON.stringify({ access_token: result.access_token, expiry })
      );

      clearCart();
      toast.success(t('orderPlaced'));
      navigate(`/order-status?ref=${result.order_ref}&token=${result.access_token}`);
    },
    onError: (err) => {
      toast.error(err.message || t('error'));
    },
  });

  const onSubmit = (data: FormData) => {
    placeOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page title */}
        <motion.h1
          className="text-3xl font-display font-bold text-leather-800 mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lang === 'ar' ? 'إتمام الطلب' : 'Finaliser la Commande'}
        </motion.h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ── Left: Delivery form ── */}
            <motion.div
              className="lg:col-span-3 space-y-5"
              initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-leather-800 mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-leather-500" />
                  {t('deliveryInfo')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <Field label={t('fullName')} error={errors.name?.message}>
                      <div className="relative">
                        <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                        <input
                          {...register('name')}
                          className={`${inputClass} ps-10`}
                          placeholder={lang === 'ar' ? 'أحمد بنعلي' : 'Ahmed Benali'}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Phone */}
                  <Field label={t('phoneNumber')} error={errors.phone?.message}>
                    <div className="relative">
                      <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        className={`${inputClass} ps-10`}
                        placeholder="06XXXXXXXX"
                        dir="ltr"
                      />
                    </div>
                  </Field>

                  {/* Email */}
                  <Field label={`${t('email')} (${t('optional')})`} error={errors.email?.message}>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                      <input
                        {...register('email')}
                        type="email"
                        className={`${inputClass} ps-10`}
                        placeholder="exemple@email.com"
                        dir="ltr"
                      />
                    </div>
                  </Field>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <Field label={t('address')} error={errors.address?.message}>
                      <div className="relative">
                        <MapPin className="absolute start-3 top-3 w-4 h-4 text-leather-400" />
                        <input
                          {...register('address')}
                          className={`${inputClass} ps-10`}
                          placeholder={lang === 'ar' ? 'شارع محمد الخامس، رقم 10' : '10 Rue Mohammed V'}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* City */}
                  <div className="sm:col-span-2">
                    <Field label={t('city')} error={errors.city?.message}>
                      <div className="relative">
                        <select
                          {...register('city')}
                          className={`${inputClass} appearance-none cursor-pointer`}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            {lang === 'ar' ? 'اختر مدينتك' : 'Choisissez votre ville'}
                          </option>
                          {MOROCCAN_CITIES.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <Field label={t('notes')}>
                      <div className="relative">
                        <MessageSquare className="absolute start-3 top-3 w-4 h-4 text-leather-400" />
                        <textarea
                          {...register('notes')}
                          rows={3}
                          className={`${inputClass} ps-10 resize-none`}
                          placeholder={lang === 'ar' ? 'أي تعليمات خاصة للتوصيل...' : 'Instructions spéciales pour la livraison...'}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-leather-800 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-leather-500" />
                  {t('paymentMethod')}
                </h2>
                <div className="border-2 border-leather-500 rounded-xl p-4 flex items-center gap-4 bg-leather-50/40">
                  <div className="w-12 h-12 rounded-full bg-leather-100 flex items-center justify-center flex-shrink-0">
                    <Banknote className="w-6 h-6 text-leather-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-leather-800">
                      {lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}
                    </p>
                    <p className="text-xs text-leather-500 mt-0.5">{t('cashOnDeliveryDesc')}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-leather-500 flex-shrink-0" />
                </div>
              </div>
            </motion.div>

            {/* ── Right: Order summary ── */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 space-y-5">
                <h2 className="text-lg font-bold text-leather-800">{t('orderSummary')}</h2>

                {/* Items list */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const name = lang === 'ar' ? item.product.name_ar : item.product.name;
                    const image = getImageUrl(item.product.images?.[0], '');
                    return (
                      <div
                        key={`${item.product.id}-${item.color}-${item.size}`}
                        className="flex items-center gap-3"
                      >
                        <div className="relative flex-shrink-0">
                          <LazyImage
                            src={image}
                            alt={name}
                            className="w-14 h-14 rounded-lg"
                          />
                          <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-ink text-white rounded-full text-xs flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-leather-800 line-clamp-1">{name}</p>
                          <p className="text-xs text-leather-400">
                            {[item.color, item.size].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-leather-700 flex-shrink-0">
                          {formatPrice(item.product.price * item.quantity, lang)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-beige-100 pt-4">
                  {/* Coupon input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-leather-700 mb-2">
                      <Tag className="inline w-4 h-4 me-1" />
                      {t('couponCode')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        placeholder={lang === 'ar' ? 'CUIR2024' : 'CUIR2024'}
                        className={`${inputClass} flex-1 uppercase`}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2.5 bg-ink text-white rounded-xl text-sm font-semibold hover:bg-ink/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t('applyCoupon')
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {couponError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {couponError}
                        </motion.p>
                      )}
                      {appliedCoupon && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="text-xs text-emerald-600 mt-1 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('couponApplied')} — {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}%`
                            : formatPrice(appliedCoupon.discount_value, lang)}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-leather-600">{t('subtotal')}</span>
                      <span className="font-medium text-leather-800">{formatPrice(subtotal, lang)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">{t('discount')}</span>
                        <span className="font-medium text-emerald-600">
                          -{formatPrice(discountAmount, lang)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-leather-600">{t('deliveryFee')}</span>
                      {deliveryFee === 0 ? (
                        <span className="font-medium text-emerald-600">{t('free')}</span>
                      ) : (
                        <span className="font-medium text-leather-800">{formatPrice(deliveryFee, lang)}</span>
                      )}
                    </div>

                    <div className="border-t border-beige-100 pt-3 flex justify-between">
                      <span className="font-bold text-leather-800">{t('total')}</span>
                      <span className="font-bold text-xl text-leather-600">{formatPrice(total, lang)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={placeOrderMutation.isPending}
                  className="w-full py-4 bg-ink text-white rounded-xl font-bold text-base hover:bg-ink/80 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('placingOrder')}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      {t('placeOrder')}
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-center text-leather-400">
                  {t('termsAgree')}{' '}
                  <Link to="/terms" className="underline hover:text-leather-600">
                    {t('termsOfService')}
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
