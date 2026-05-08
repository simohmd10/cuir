import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, Package,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Order, OrderItem, Customer, OrderStatus } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderWithDetails = Order & {
  customer: Customer | null;
  order_items: (OrderItem & { product_image?: string })[];
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchOrders(page: number, status: string, search: string, dateFrom: string, dateTo: string) {
  let query = supabase
    .from('orders')
    .select(
      `*, customer:customers(*), order_items(*)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * 10, page * 10 - 1);

  if (status) query = query.eq('status', status);
  if (search) {
    query = query.or(`order_ref.ilike.%${search}%`);
  }
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as OrderWithDetails[], count: count ?? 0 };
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string; lang: 'ar' | 'fr' }> = ({ status, lang }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
    {getStatusLabel(status, lang)}
  </span>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Status options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// ─── Main component ───────────────────────────────────────────────────────────

const Orders: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter, search, dateFrom, dateTo],
    queryFn: () => fetchOrders(page, statusFilter, search, dateFrom, dateTo),
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(lang === 'ar' ? 'تم تحديث الحالة' : 'Statut mis à jour');
    },
    onError: () => toast.error(lang === 'ar' ? 'خطأ في التحديث' : 'Erreur de mise à jour'),
  });

  const totalPages = Math.ceil((data?.count ?? 0) / 10);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-leather-800">
            {lang === 'ar' ? 'الطلبات' : 'Commandes'}
          </h1>
          <p className="text-sm text-leather-400">{data?.count ?? 0} {lang === 'ar' ? 'طلب' : 'commandes'}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={lang === 'ar' ? 'بحث برقم الطلب...' : 'Rechercher par réf...'}
              className="w-full pl-9 pr-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-leather-200 rounded-lg text-sm bg-white text-leather-700 focus:outline-none focus:ring-2 focus:ring-leather-400"
          >
            <option value="">{lang === 'ar' ? 'كل الحالات' : 'Tous les statuts'}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{getStatusLabel(s, lang)}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 text-leather-700"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 text-leather-700"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-leather-100 bg-leather-50/50">
                  <th className="w-8 px-3 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المرجع' : 'Réf'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الهاتف' : 'Téléphone'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المدينة' : 'Ville'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المنتجات' : 'Articles'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المجموع' : 'Total'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الحالة' : 'Statut'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-leather-50">
                      <td className="px-3 py-3"><Sk className="w-4 h-4" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-32" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-8" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-20" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24 rounded-full" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-28" /></td>
                    </tr>
                  ))
                  : (data?.data ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-leather-400 text-sm">
                        {lang === 'ar' ? 'لا توجد طلبات' : 'Aucune commande trouvée'}
                      </td>
                    </tr>
                  )
                  : (data?.data ?? []).map((order) => {
                    const isExpanded = expandedId === order.id;
                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          className="border-b border-leather-50 hover:bg-leather-50/40 transition-colors cursor-pointer"
                          onClick={() => toggleExpand(order.id)}
                        >
                          <td className="px-3 py-3 text-leather-400">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-medium text-leather-600">{order.order_ref}</td>
                          <td className="px-4 py-3 text-leather-700">{order.customer?.name ?? '—'}</td>
                          <td className="px-4 py-3 text-leather-500 font-mono text-xs">{order.customer?.phone ?? '—'}</td>
                          <td className="px-4 py-3 text-leather-500">{order.customer?.city ?? '—'}</td>
                          <td className="px-4 py-3 text-leather-500">{order.order_items?.length ?? 0}</td>
                          <td className="px-4 py-3 font-semibold text-leather-800">{formatPrice(order.total, lang)}</td>
                          <td className="px-4 py-3"><StatusBadge status={order.status} lang={lang} /></td>
                          <td className="px-4 py-3 text-leather-400 text-xs whitespace-nowrap">{formatDate(order.created_at, lang)}</td>
                        </tr>

                        {/* Expanded row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={9} className="p-0 border-b border-leather-100">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-5 bg-leather-50/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Order items */}
                                    <div>
                                      <h4 className="text-xs font-semibold text-leather-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <Package size={13} />
                                        {lang === 'ar' ? 'المنتجات' : 'Articles commandés'}
                                      </h4>
                                      <div className="space-y-2">
                                        {(order.order_items ?? []).map((item) => (
                                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-leather-100">
                                            <div className="text-sm flex-1">
                                              <p className="font-medium text-leather-800">{item.product_name}</p>
                                              <p className="text-xs text-leather-400">
                                                {item.color && `${item.color} `}{item.size && `• ${item.size}`}
                                              </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                              <p className="text-xs text-leather-500">×{item.quantity}</p>
                                              <p className="text-sm font-semibold text-leather-800">{formatPrice(item.price_at_purchase * item.quantity, lang)}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Customer + status */}
                                    <div className="space-y-4">
                                      {order.customer && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-leather-600 uppercase tracking-wide mb-2">
                                            {lang === 'ar' ? 'معلومات العميل' : 'Informations client'}
                                          </h4>
                                          <div className="bg-white rounded-lg p-3 border border-leather-100 space-y-1.5 text-sm">
                                            <p className="font-medium text-leather-800">{order.customer.name}</p>
                                            <p className="text-leather-500 font-mono text-xs">{order.customer.phone}</p>
                                            {order.customer.email && <p className="text-leather-500 text-xs">{order.customer.email}</p>}
                                            <p className="text-leather-500 text-xs">{order.customer.address}, {order.customer.city}</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Status change */}
                                      <div>
                                        <h4 className="text-xs font-semibold text-leather-600 uppercase tracking-wide mb-2">
                                          {lang === 'ar' ? 'تغيير الحالة' : 'Changer le statut'}
                                        </h4>
                                        <div className="flex gap-2 items-center">
                                          <select
                                            defaultValue={order.status}
                                            id={`status-${order.id}`}
                                            className="flex-1 px-3 py-2 border border-leather-200 rounded-lg text-sm bg-white text-leather-700 focus:outline-none focus:ring-2 focus:ring-leather-400"
                                          >
                                            {STATUS_OPTIONS.map((s) => (
                                              <option key={s} value={s}>{getStatusLabel(s, lang)}</option>
                                            ))}
                                          </select>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const sel = document.getElementById(`status-${order.id}`) as HTMLSelectElement;
                                              updateStatusMutation.mutate({ id: order.id, status: sel.value as OrderStatus });
                                            }}
                                            disabled={updateStatusMutation.isPending}
                                            className="px-3 py-2 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                                          >
                                            {updateStatusMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                                            {lang === 'ar' ? 'تحديث' : 'Mettre à jour'}
                                          </button>
                                        </div>
                                      </div>

                                      {/* Order summary */}
                                      <div className="bg-white rounded-lg p-3 border border-leather-100 text-sm space-y-1.5">
                                        {order.discount_amount > 0 && (
                                          <div className="flex justify-between text-leather-500">
                                            <span>{lang === 'ar' ? 'الخصم' : 'Remise'}</span>
                                            <span className="text-green-600">-{formatPrice(order.discount_amount, lang)}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between text-leather-500">
                                          <span>{lang === 'ar' ? 'التوصيل' : 'Livraison'}</span>
                                          <span>{formatPrice(order.delivery_fee ?? 30, lang)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-leather-800 border-t border-leather-100 pt-1.5 mt-1.5">
                                          <span>{lang === 'ar' ? 'المجموع' : 'Total'}</span>
                                          <span>{formatPrice(order.total, lang)}</span>
                                        </div>
                                        {order.coupon_code && (
                                          <p className="text-xs text-leather-400">
                                            Coupon: <span className="font-mono font-medium">{order.coupon_code}</span>
                                          </p>
                                        )}
                                        {order.notes && (
                                          <p className="text-xs text-leather-500 italic border-t border-leather-100 pt-1.5">{order.notes}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-leather-100">
              <p className="text-xs text-leather-400">
                {lang === 'ar' ? `صفحة ${page} من ${totalPages}` : `Page ${page} sur ${totalPages}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-leather-200 text-leather-600 disabled:opacity-40 hover:bg-leather-50 transition-colors"
                >
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

export default Orders;
