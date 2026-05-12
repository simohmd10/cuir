import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Clock, Cog, Truck, CheckCircle2, XCircle, Search,
  Package, MapPin, User, Phone, MessageCircle, Loader2,
  AlertCircle,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { supabase } from '../lib/supabase';
import { formatPrice, getImageUrl, formatDate } from '../lib/utils';
import LazyImage from '../components/ui/LazyImage';
import type { Order, OrderStatus } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface SearchForm {
  order_ref: string;
  access_token: string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

function statusIcon(status: OrderStatus) {
  const cls = 'w-5 h-5';
  switch (status) {
    case 'pending':    return <Clock className={cls} />;
    case 'processing': return <Cog className={`${cls} animate-spin-slow`} />;
    case 'shipped':    return <Truck className={cls} />;
    case 'delivered':  return <CheckCircle2 className={cls} />;
    case 'cancelled':  return <XCircle className={cls} />;
    default:           return <Clock className={cls} />;
  }
}

function statusColor(status: OrderStatus) {
  switch (status) {
    case 'pending':    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'shipped':    return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'delivered':  return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'cancelled':  return 'bg-red-100 text-red-700 border-red-300';
    default:           return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function stepColor(step: OrderStatus, currentStatus: OrderStatus) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
  const stepIdx = STATUS_STEPS.indexOf(step);
  if (currentStatus === 'cancelled') return 'bg-gray-200 text-gray-400';
  if (stepIdx < currentIdx) return 'bg-leather-500 text-white';
  if (stepIdx === currentIdx) return 'bg-leather-500 text-white ring-4 ring-leather-200';
  return 'bg-gray-200 text-gray-400';
}

const SESSION_TTL = 90 * 60 * 1000; // 90 minutes

// ── Main component ────────────────────────────────────────────────────────────

export default function OrderStatus() {
  const { t, lang, dir } = useLanguage();
  usePageMeta(lang === 'ar' ? 'تتبع طلبك | كوير' : 'Suivi de commande | Cuir');
  const [searchParams] = useSearchParams();

  const refParam = searchParams.get('ref') || '';
  const tokenParam = searchParams.get('token') || '';

  const [queryRef, setQueryRef] = useState(refParam);
  const [queryToken, setQueryToken] = useState(tokenParam);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchForm>({
    defaultValues: { order_ref: refParam, access_token: tokenParam },
  });

  // ── Lookup query ──────────────────────────────────────────────────────────

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useQuery<Order | null>({
    queryKey: ['order', queryRef, queryToken],
    queryFn: async () => {
      if (!queryRef || !queryToken) return null;

      const { data, error } = await supabase.rpc('lookup_order', {
        p_order_ref: queryRef,
        p_access_token: queryToken,
      });

      if (error) throw new Error(error.message);
      if (!data) return null;

      // Persist token to sessionStorage
      const expiry = Date.now() + SESSION_TTL;
      sessionStorage.setItem(
        `order_${queryRef}`,
        JSON.stringify({ access_token: queryToken, expiry })
      );

      return data as Order;
    },
    enabled: !!queryRef && !!queryToken,
    retry: false,
  });

  // Auto-lookup when URL params are present
  useEffect(() => {
    if (refParam && tokenParam) {
      setQueryRef(refParam);
      setQueryToken(tokenParam);
      setHasSearched(true);
    }
  }, [refParam, tokenParam]);

  const onSubmit = (formData: SearchForm) => {
    setQueryRef(formData.order_ref.trim().toUpperCase());
    setQueryToken(formData.access_token.trim());
    setHasSearched(true);
    setTimeout(() => refetch(), 50);
  };

  const inputClass = 'input-soft';

  const stepLabels: Record<OrderStatus, { ar: string; fr: string }> = {
    pending:    { ar: 'قيد الانتظار', fr: 'En attente' },
    processing: { ar: 'قيد المعالجة', fr: 'En traitement' },
    shipped:    { ar: 'تم الشحن', fr: 'Expédié' },
    delivered:  { ar: 'تم التسليم', fr: 'Livré' },
    cancelled:  { ar: 'ملغي', fr: 'Annulé' },
  };

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-leather-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-leather-500" />
          </div>
          <h1 className="text-3xl font-display font-bold text-leather-800">{t('trackOrder')}</h1>
          <p className="text-leather-500 mt-2 text-sm">
            {lang === 'ar'
              ? 'أدخل رقم طلبك ورمز الوصول لمتابعة حالة طلبك'
              : 'Entrez votre numéro de commande et code d\'accès pour suivre votre commande'}
          </p>
        </motion.div>

        {/* ── Search form ── */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="card-luxury-static p-6 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Order ref */}
            <div>
              <label className="block text-sm font-medium text-leather-700 mb-1.5">
                {t('orderRef')}
              </label>
              <input
                {...register('order_ref', { required: true })}
                className={`${inputClass} uppercase`}
                placeholder="CU-ABC123-XYZ"
                dir="ltr"
              />
              {errors.order_ref && (
                <p className="text-xs text-red-500 mt-1">{t('required')}</p>
              )}
            </div>

            {/* Access token */}
            <div>
              <label className="block text-sm font-medium text-leather-700 mb-1.5">
                {t('accessToken')}
              </label>
              <input
                {...register('access_token', { required: true })}
                className={inputClass}
                placeholder="xxxxxxxx-xxxx"
                dir="ltr"
              />
              {errors.access_token && (
                <p className="text-xs text-red-500 mt-1">{t('required')}</p>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn-solid mt-4 w-full py-3 font-bold"
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                {t('trackNow')}
              </>
            )}
          </motion.button>
        </motion.form>

        {/* ── Results ── */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-10 h-10 text-leather-400 animate-spin mx-auto" />
              <p className="mt-3 text-leather-500 text-sm">{t('loading')}</p>
            </motion.div>
          )}

          {!isLoading && hasSearched && (isError || !order) && (
            <motion.div
              key="not-found"
              className="card-luxury-static p-8 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-leather-800 mb-1">{t('orderNotFound')}</h2>
              <p className="text-leather-500 text-sm">{t('checkDetails')}</p>
            </motion.div>
          )}

          {!isLoading && order && (
            <motion.div
              key="order"
              className="space-y-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Order reference + status badge */}
              <div className="card-luxury-static p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs text-leather-400 mb-1">{t('yourOrderRef')}</p>
                    <h2 className="text-2xl font-display font-bold text-leather-800">
                      {order.order_ref}
                    </h2>
                    <p className="text-xs text-leather-400 mt-1">{t('saveRef')}</p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm self-start sm:self-auto ${statusColor(order.status)}`}
                  >
                    {statusIcon(order.status)}
                    {stepLabels[order.status]?.[lang]}
                  </div>
                </div>

                {order.created_at && (
                  <p className="text-xs text-leather-400">
                    {t('orderDate')}: {formatDate(order.created_at, lang)}
                  </p>
                )}
              </div>

              {/* Visual stepper */}
              {order.status !== 'cancelled' && (
                <div className="card-luxury-static p-6">
                  <div className="flex items-center justify-between">
                    {STATUS_STEPS.map((step, idx) => (
                      <React.Fragment key={step}>
                        {/* Step circle */}
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${stepColor(step, order.status)}`}
                          >
                            {statusIcon(step)}
                          </div>
                          <span className="text-xs text-center text-leather-600 font-medium leading-tight hidden sm:block">
                            {stepLabels[step]?.[lang]}
                          </span>
                        </div>

                        {/* Connector */}
                        {idx < STATUS_STEPS.length - 1 && (
                          <div
                            className={`h-1 flex-1 rounded-full mx-1 transition-colors duration-300 ${
                              STATUS_STEPS.indexOf(order.status) > idx
                                ? 'bg-leather-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer info */}
              {order.customer && (
                <div className="card-luxury-static p-6">
                  <h3 className="font-bold text-leather-800 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-leather-500" />
                    {lang === 'ar' ? 'معلومات العميل' : 'Informations client'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-leather-400 flex-shrink-0" />
                      <span className="text-leather-700">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-leather-400 flex-shrink-0" />
                      <span className="text-leather-700 dir-ltr">{order.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-leather-400 flex-shrink-0" />
                      <span className="text-leather-700">{order.customer.city}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="card-luxury-static p-6">
                  <h3 className="font-bold text-leather-800 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-leather-500" />
                    {t('orderItems')} ({order.order_items.length})
                  </h3>
                  <div className="space-y-3">
                    {order.order_items.map((item) => {
                      const name = lang === 'ar' ? item.product_name_ar : item.product_name;
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-beige-100 flex-shrink-0 overflow-hidden">
                            <LazyImage
                              src={getImageUrl('')}
                              alt={name}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-leather-800 line-clamp-1">{name}</p>
                            <p className="text-xs text-leather-400">
                              {[item.color, item.size].filter(Boolean).join(' · ')} × {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-leather-700">
                            {formatPrice(item.price_at_purchase * item.quantity, lang)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div className="card-luxury-static p-6">
                <h3 className="font-bold text-leather-800 mb-4">
                  {lang === 'ar' ? 'ملخص المبالغ' : 'Récapitulatif des montants'}
                </h3>
                <div className="space-y-2 text-sm">
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-leather-600">{t('discount')}</span>
                      <span className="font-medium text-emerald-600">
                        -{formatPrice(order.discount_amount, lang)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-beige-100 pt-2 flex justify-between">
                    <span className="font-bold text-leather-800">{t('total')}</span>
                    <span className="font-bold text-xl text-leather-600">
                      {formatPrice(order.total, lang)}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp help */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-leather-600 text-sm mb-3">
                  {lang === 'ar'
                    ? 'هل تحتاج مساعدة بخصوص طلبك؟'
                    : 'Besoin d\'aide concernant votre commande ?'}
                </p>
                <a
                  href={`https://wa.me/212691553120?text=${encodeURIComponent(
                    lang === 'ar'
                      ? `مرحباً، أريد الاستفسار عن طلبي رقم: ${order.order_ref}`
                      : `Bonjour, je souhaite me renseigner sur ma commande : ${order.order_ref}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#25D366] text-white rounded-full text-sm font-semibold hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('whatsapp')}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
