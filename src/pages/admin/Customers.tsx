import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X, User, ShoppingCart } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { Customer, Order } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type CustomerWithStats = Customer & {
  order_count: number;
  total_spent: number;
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchCustomers(page: number, search: string) {
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * 10, page * 10 - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Customer[], count: count ?? 0 };
}

async function fetchCustomerOrders(customerId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Customer detail modal ────────────────────────────────────────────────────

const CustomerModal: React.FC<{
  customer: Customer;
  onClose: () => void;
  lang: 'ar' | 'fr';
}> = ({ customer, onClose, lang }) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customer-orders', customer.id],
    queryFn: () => fetchCustomerOrders(customer.id),
    staleTime: 30_000,
  });

  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-leather-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-leather-100 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-leather-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-leather-800">{customer.name}</h2>
              <p className="text-xs text-leather-400">{customer.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-leather-50 text-leather-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div className="bg-leather-50/50 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-leather-600 uppercase tracking-wide mb-3">
              {lang === 'ar' ? 'معلومات العميل' : 'Informations client'}
            </h3>
            {[
              { label: lang === 'ar' ? 'الاسم' : 'Nom', value: customer.name },
              { label: lang === 'ar' ? 'الهاتف' : 'Téléphone', value: customer.phone },
              { label: 'Email', value: customer.email || '—' },
              { label: lang === 'ar' ? 'العنوان' : 'Adresse', value: customer.address },
              { label: lang === 'ar' ? 'المدينة' : 'Ville', value: customer.city },
              {
                label: lang === 'ar' ? 'العضو منذ' : 'Membre depuis',
                value: formatDate(customer.created_at, lang),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-leather-500">{label}</span>
                <span className="text-leather-800 font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-leather-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-leather-800">{orders.length}</p>
              <p className="text-xs text-leather-500 mt-0.5">{lang === 'ar' ? 'الطلبات' : 'Commandes'}</p>
            </div>
            <div className="bg-white border border-leather-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-leather-800">{formatPrice(totalSpent, lang)}</p>
              <p className="text-xs text-leather-500 mt-0.5">{lang === 'ar' ? 'إجمالي الإنفاق' : 'Total dépensé'}</p>
            </div>
          </div>

          {/* Orders */}
          <div>
            <h3 className="text-xs font-semibold text-leather-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShoppingCart size={13} />
              {lang === 'ar' ? 'الطلبات' : 'Historique des commandes'}
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-16 w-full rounded-xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-leather-400 text-center py-6">
                {lang === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}
              </p>
            ) : (
              <div className="space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-leather-100 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-medium text-leather-600">{order.order_ref}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status, lang)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-leather-400">{formatDate(order.created_at, lang)}</span>
                      <span className="text-sm font-semibold text-leather-800">{formatPrice(order.total, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const Customers: React.FC = () => {
  const { lang } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => fetchCustomers(page, search),
    staleTime: 30_000,
  });

  const totalPages = Math.ceil((data?.count ?? 0) / 10);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-leather-800">
            {lang === 'ar' ? 'العملاء' : 'Clients'}
          </h1>
          <p className="text-sm text-leather-400">{data?.count ?? 0} {lang === 'ar' ? 'عميل' : 'clients'}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-leather-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={lang === 'ar' ? 'بحث بالاسم، الهاتف، البريد...' : 'Nom, téléphone, email...'}
            className="w-full pl-9 pr-3 py-2 border border-leather-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-leather-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-leather-100 bg-leather-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الاسم' : 'Nom'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الهاتف' : 'Téléphone'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'المدينة' : 'Ville'}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'تاريخ الانضمام' : 'Inscription'}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-leather-500 uppercase tracking-wide">{lang === 'ar' ? 'الطلبات' : 'Commandes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-leather-50">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3"><Sk className="h-4 w-36" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-40" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-24" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-28" /></td>
                      <td className="px-4 py-3"><Sk className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                  : (data?.data ?? []).length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-leather-400 text-sm">
                        {lang === 'ar' ? 'لا يوجد عملاء' : 'Aucun client trouvé'}
                      </td>
                    </tr>
                  )
                  : (data?.data ?? []).map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-leather-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-leather-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-leather-600 font-bold text-xs uppercase">
                              {customer.name?.[0] ?? '?'}
                            </span>
                          </div>
                          <span className="font-medium text-leather-800">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-leather-600">{customer.phone}</td>
                      <td className="px-4 py-3 text-leather-500 text-xs">{customer.email || '—'}</td>
                      <td className="px-4 py-3 text-leather-500">{customer.city}</td>
                      <td className="px-4 py-3 text-leather-400 text-xs">{formatDate(customer.created_at, lang)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-leather-500 text-xs">
                          <ShoppingCart size={12} />
                          {lang === 'ar' ? 'عرض' : 'Voir'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

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

      {/* Customer detail modal */}
      <AnimatePresence>
        {selectedCustomer && (
          <CustomerModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Customers;
