import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import StarRating from '../../components/ui/StarRating';
import { supabase } from '../../lib/supabase';
import { formatDate, truncate } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Review } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewWithProduct = Review & {
  product: { name: string; name_ar: string } | null;
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchReviews(page: number, status: string) {
  let query = supabase
    .from('reviews')
    .select(`*, product:products(name, name_ar)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * 10, page * 10 - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as ReviewWithProduct[], count: count ?? 0 };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: { ar: string; fr: string }; className: string }> = {
  pending: { label: { ar: 'قيد الانتظار', fr: 'En attente' }, className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  approved: { label: { ar: 'موافق عليه', fr: 'Approuvé' }, className: 'bg-green-50 text-green-700 border border-green-200' },
  rejected: { label: { ar: 'مرفوض', fr: 'Rejeté' }, className: 'bg-red-50 text-red-700 border border-red-200' },
};

// ─── Main component ───────────────────────────────────────────────────────────

const Reviews: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: () => fetchReviews(page, statusFilter),
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin-reviews'] });
      setSelectedIds(new Set());
      toast.success(
        status === 'approved'
          ? (lang === 'ar' ? 'تمت الموافقة على التقييم' : 'Avis approuvé')
          : (lang === 'ar' ? 'تم رفض التقييم' : 'Avis rejeté')
      );
    },
    onError: () => toast.error(lang === 'ar' ? 'خطأ في التحديث' : 'Erreur de mise à jour'),
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    const pendingIds = (data?.data ?? [])
      .filter((r) => r.status === 'pending')
      .map((r) => r.id);
    setSelectedIds(new Set(pendingIds));
  };

  const totalPages = Math.ceil((data?.count ?? 0) / 10);
  const pendingReviews = (data?.data ?? []).filter((r) => r.status === 'pending');

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-leather-800">
              {lang === 'ar' ? 'التقييمات' : 'Avis clients'}
            </h1>
            <p className="text-sm text-leather-400">{data?.count ?? 0} {lang === 'ar' ? 'تقييم' : 'avis'}</p>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-leather-600 font-medium">
                {selectedIds.size} {lang === 'ar' ? 'محدد' : 'sélectionné(s)'}
              </span>
              <button
                onClick={() => updateStatusMutation.mutate({ ids: [...selectedIds], status: 'approved' })}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
              >
                {updateStatusMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                {lang === 'ar' ? 'موافقة على الكل' : 'Approuver tout'}
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ ids: [...selectedIds], status: 'rejected' })}
                disabled={updateStatusMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                <XCircle size={13} />
                {lang === 'ar' ? 'رفض الكل' : 'Rejeter tout'}
              </button>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-leather-100/60 rounded-lg p-1">
            {(['', 'pending', 'approved', 'rejected'] as const).map((s) => {
              const labels: Record<string, { ar: string; fr: string }> = {
                '': { ar: 'الكل', fr: 'Tous' },
                pending: { ar: 'قيد الانتظار', fr: 'En attente' },
                approved: { ar: 'موافق عليها', fr: 'Approuvés' },
                rejected: { ar: 'مرفوضة', fr: 'Rejetés' },
              };
              return (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); setSelectedIds(new Set()); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-white text-leather-800 shadow-sm'
                      : 'text-leather-500 hover:text-leather-700'
                  }`}
                >
                  {labels[s][lang]}
                </button>
              );
            })}
          </div>

          {statusFilter === 'pending' && pendingReviews.length > 0 && (
            <button
              onClick={selectAllPending}
              className="text-xs text-leather-500 hover:text-leather-700 underline transition-colors"
            >
              {lang === 'ar' ? 'تحديد الكل المعلق' : 'Sélectionner tous les en attente'}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-leather-100 bg-leather-50/50">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) selectAllPending();
                        else setSelectedIds(new Set());
                      }}
                      checked={selectedIds.size > 0 && selectedIds.size === pendingReviews.length}
                      className="w-4 h-4 rounded border-leather-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المنتج' : 'Produit'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'التقييم' : 'Note'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'التعليق' : 'Commentaire'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leather-50">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Sk className="w-4 h-4" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20 rounded-full" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                  : (data?.data ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <Star size={32} className="text-leather-300 mx-auto mb-2" />
                        <p className="text-leather-400 text-sm">
                          {lang === 'ar' ? 'لا توجد تقييمات' : 'Aucun avis'}
                        </p>
                      </td>
                    </tr>
                  )
                  : (data?.data ?? []).map((review) => {
                    const cfg = statusConfig[review.status];
                    const isPending = review.status === 'pending';
                    return (
                      <tr key={review.id} className={`hover:bg-leather-50/40 transition-colors ${selectedIds.has(review.id) ? 'bg-leather-50/60' : ''}`}>
                        <td className="px-4 py-3">
                          {isPending && (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(review.id)}
                              onChange={() => toggleSelect(review.id)}
                              className="w-4 h-4 rounded border-leather-300"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-leather-800 text-xs max-w-[140px] truncate">
                            {lang === 'ar' ? review.product?.name_ar : review.product?.name}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-leather-700">{review.user_name}</td>
                        <td className="px-4 py-3">
                          <StarRating rating={review.rating} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-leather-500 max-w-[200px]">
                          <span title={review.comment}>{truncate(review.comment, 60)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                            {cfg.label[lang]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-leather-400 text-xs whitespace-nowrap">
                          {formatDate(review.created_at, lang)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {review.status !== 'approved' && (
                              <button
                                onClick={() => updateStatusMutation.mutate({ ids: [review.id], status: 'approved' })}
                                disabled={updateStatusMutation.isPending}
                                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                                title={lang === 'ar' ? 'موافقة' : 'Approuver'}
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {review.status !== 'rejected' && (
                              <button
                                onClick={() => updateStatusMutation.mutate({ ids: [review.id], status: 'rejected' })}
                                disabled={updateStatusMutation.isPending}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                                title={lang === 'ar' ? 'رفض' : 'Rejeter'}
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-leather-100">
              <p className="text-xs text-leather-400">
                {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} sur ${totalPages}`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reviews;
