import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, X, Loader2, ToggleLeft, ToggleRight, Ticket } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Coupon } from '../../types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const couponSchema = z.object({
  code: z.string().min(3, 'Code min 3 caractères').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().positive('Valeur > 0'),
  min_order_amount: z.coerce.number().min(0).default(0),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
  usage_limit: z.coerce.number().int().positive().optional().or(z.literal('')),
});

type CouponForm = z.infer<typeof couponSchema>;

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCoupons() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Coupon[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Main component ───────────────────────────────────────────────────────────

const Coupons: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchCoupons,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CouponForm>({ resolver: zodResolver(couponSchema) });

  const discountType = watch('discount_type');

  const openAdd = () => {
    setEditingCoupon(null);
    reset({
      code: '', discount_type: 'percentage', discount_value: 10,
      min_order_amount: 0, expires_at: '', is_active: true, usage_limit: '',
    });
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount ?? 0,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
      usage_limit: coupon.usage_limit ?? '',
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (form: CouponForm) => {
      const payload = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_amount: form.min_order_amount,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      };
      if (editingCoupon) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editingCoupon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(editingCoupon ? 'Coupon mis à jour' : 'Coupon créé');
      setModalOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || 'Erreur lors de la sauvegarde'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(lang === 'ar' ? 'تم التحديث' : 'Statut mis à jour');
    },
    onError: () => toast.error('Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon supprimé');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const formatExpiry = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const expired = d < now;
    return (
      <span className={expired ? 'text-red-500' : 'text-leather-600'}>
        {formatDate(dateStr, lang)}
        {expired && ' ⚠'}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-leather-800">
              {lang === 'ar' ? 'الكوبونات' : 'Coupons de réduction'}
            </h1>
            <p className="text-sm text-leather-400">{coupons.length} {lang === 'ar' ? 'كوبون' : 'coupons'}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors"
          >
            <Plus size={16} />
            {lang === 'ar' ? 'إضافة كوبون' : 'Créer un coupon'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-leather-100 bg-leather-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الكود' : 'Code'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'القيمة' : 'Valeur'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الحد الأدنى' : 'Min commande'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الانتهاء' : 'Expiration'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الاستخدام' : 'Utilisations'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leather-50">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><Sk className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : coupons.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <Ticket size={32} className="text-leather-300 mx-auto mb-2" />
                        <p className="text-leather-400 text-sm">
                          {lang === 'ar' ? 'لا توجد كوبونات بعد' : 'Aucun coupon'}
                        </p>
                      </td>
                    </tr>
                  )
                  : coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-leather-50/40 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-leather-800 text-sm tracking-widest">{coupon.code}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          coupon.discount_type === 'percentage'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {coupon.discount_type === 'percentage'
                            ? (lang === 'ar' ? 'نسبة مئوية' : 'Pourcentage')
                            : (lang === 'ar' ? 'مبلغ ثابت' : 'Montant fixe')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-leather-800">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : formatPrice(coupon.discount_value, lang)}
                      </td>
                      <td className="px-4 py-3 text-leather-500">
                        {coupon.min_order_amount > 0 ? formatPrice(coupon.min_order_amount, lang) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {coupon.expires_at ? formatExpiry(coupon.expires_at) : <span className="text-leather-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-leather-500 text-center">
                        {coupon.usage_count ?? 0}
                        {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleMutation.mutate({ id: coupon.id, is_active: !coupon.is_active })}
                          disabled={toggleMutation.isPending}
                          className="flex items-center gap-1.5 transition-colors"
                        >
                          {coupon.is_active
                            ? <ToggleRight size={22} className="text-green-500" />
                            : <ToggleLeft size={22} className="text-leather-300" />}
                          <span className={`text-xs font-medium ${coupon.is_active ? 'text-green-600' : 'text-leather-400'}`}>
                            {coupon.is_active
                              ? (lang === 'ar' ? 'نشط' : 'Actif')
                              : (lang === 'ar' ? 'معطل' : 'Inactif')}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg text-leather-500 hover:bg-leather-100 hover:text-leather-700 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(coupon)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-leather-100">
                  <h2 className="text-lg font-semibold text-leather-800">
                    {editingCoupon
                      ? (lang === 'ar' ? 'تعديل الكوبون' : 'Modifier le coupon')
                      : (lang === 'ar' ? 'إنشاء كوبون' : 'Créer un coupon')}
                  </h2>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-leather-50 text-leather-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
                  {/* Code */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">Code *</label>
                    <input
                      {...register('code')}
                      className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-leather-400"
                      placeholder="PROMO20"
                    />
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
                  </div>

                  {/* Type + Value */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-leather-600 mb-1">
                        {lang === 'ar' ? 'نوع الخصم' : 'Type de remise'} *
                      </label>
                      <select
                        {...register('discount_type')}
                        className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm bg-white text-leather-700 focus:outline-none focus:ring-2 focus:ring-leather-400"
                      >
                        <option value="percentage">{lang === 'ar' ? 'نسبة مئوية (%)' : 'Pourcentage (%)'}</option>
                        <option value="fixed">{lang === 'ar' ? 'مبلغ ثابت (DH)' : 'Montant fixe (DH)'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-leather-600 mb-1">
                        {discountType === 'percentage' ? 'Valeur (%)' : 'Valeur (DH)'} *
                      </label>
                      <input
                        type="number"
                        {...register('discount_value')}
                        className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
                      />
                      {errors.discount_value && <p className="text-red-500 text-xs mt-1">{errors.discount_value.message}</p>}
                    </div>
                  </div>

                  {/* Min order */}
                  <div>
                    <label className="block text-xs font-medium text-leather-600 mb-1">
                      {lang === 'ar' ? 'الحد الأدنى للطلب (DH)' : 'Montant min. de commande (DH)'}
                    </label>
                    <input
                      type="number"
                      {...register('min_order_amount')}
                      className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
                    />
                  </div>

                  {/* Expires + Limit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-leather-600 mb-1">
                        {lang === 'ar' ? 'تاريخ الانتهاء' : "Date d'expiration"}
                      </label>
                      <input
                        type="date"
                        {...register('expires_at')}
                        className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 text-leather-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-leather-600 mb-1">
                        {lang === 'ar' ? 'حد الاستخدام' : "Limite d'utilisation"}
                      </label>
                      <input
                        type="number"
                        {...register('usage_limit')}
                        placeholder={lang === 'ar' ? 'بلا حد' : 'Illimité'}
                        className="w-full border border-leather-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
                      />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      className="w-4 h-4 rounded border-leather-300 text-leather-500 focus:ring-leather-400"
                    />
                    <span className="text-sm text-leather-700">
                      {lang === 'ar' ? 'نشط (يمكن استخدامه)' : 'Actif (utilisable)'}
                    </span>
                  </label>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-leather-200 rounded-lg text-sm text-leather-600 hover:bg-leather-50 transition-colors">
                      {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || saveMutation.isPending}
                      className="flex-1 py-2.5 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {(isSubmitting || saveMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                      {lang === 'ar' ? 'حفظ' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-leather-800 mb-2">
                {lang === 'ar' ? 'تأكيد الحذف' : 'Confirmer la suppression'}
              </h3>
              <p className="text-sm text-leather-500 mb-6">
                {lang === 'ar'
                  ? `حذف الكوبون "${deleteTarget.code}"؟`
                  : `Supprimer le coupon "${deleteTarget.code}" ?`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-leather-200 rounded-lg text-sm text-leather-600 hover:bg-leather-50 transition-colors">
                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  {lang === 'ar' ? 'حذف' : 'Supprimer'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Coupons;
