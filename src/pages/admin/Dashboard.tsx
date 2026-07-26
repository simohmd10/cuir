import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Badge from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate, getStatusColor } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import type { DashboardStats, Order } from '../../types';

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchDashboardData() {
  const [ordersRes, customersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_ref, total, status, created_at, customer:customers(name, phone)')
      .order('created_at', { ascending: false }),
    supabase.from('customers').select('id, created_at'),
  ]);

  if (ordersRes.error) throw ordersRes.error;
  if (customersRes.error) throw customersRes.error;

  return {
    orders: (ordersRes.data ?? []) as unknown as (Order & { customer: { name: string; phone: string } | null })[],
    customers: customersRes.data ?? [],
  };
}

// ─── Stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bg, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-leather-100 p-5 flex items-start gap-4 shadow-sm"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <span className={color}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-leather-800 leading-tight">{value}</p>
      <p className="text-sm text-leather-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-leather-400 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

// ─── Simple CSS bar chart ─────────────────────────────────────────────────────

const BarChart: React.FC<{ data: { date: string; amount: number }[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d) => {
        const pct = Math.round((d.amount / max) * 100);
        const label = new Date(d.date).toLocaleDateString('fr-MA', { weekday: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-leather-400 font-medium hidden sm:block">
              {d.amount > 0 ? `${Math.round(d.amount)}` : ''}
            </span>
            <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 2)}%` }}
                transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[32px] rounded-t-md bg-leather-400 hover:bg-leather-500 transition-colors cursor-default"
                style={{ height: `${Math.max(pct, 2)}%` }}
                title={`${d.date}: ${d.amount} MAD`}
              />
            </div>
            <span className="text-xs text-leather-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded ${className}`} />
);

// ─── Main component ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 60_000,
  });

  const stats = useMemo<DashboardStats | null>(() => {
    if (!data) return null;
    const { orders, customers } = data;

    const today = new Date().toDateString();
    const total_sales = orders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.total : 0), 0);
    const today_sales = orders
      .filter((o) => new Date(o.created_at!).toDateString() === today && o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    const total_orders = orders.length;
    const pending_orders = orders.filter((o) => o.status === 'pending').length;
    const total_customers = customers.length;
    const new_customers_today = customers.filter(
      (c) => new Date((c as { created_at: string }).created_at).toDateString() === today
    ).length;

    // last 7 days
    const daily_sales: { date: string; amount: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(
        (o) => o.created_at?.startsWith(dateStr) && o.status !== 'cancelled'
      );
      daily_sales.push({
        date: dateStr,
        amount: dayOrders.reduce((s, o) => s + o.total, 0),
        orders: dayOrders.length,
      });
    }

    return { total_sales, today_sales, total_orders, pending_orders, total_customers, new_customers_today, daily_sales };
  }, [data]);

  const recentOrders = useMemo(
    () => (data?.orders ?? []).slice(0, 10),
    [data]
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-xl font-bold text-leather-800">
            {lang === 'ar' ? 'لوحة التحكم' : 'Tableau de Bord'}
          </h1>
          <p className="text-sm text-leather-400 mt-0.5">
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-leather-100 p-5">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label={lang === 'ar' ? 'إجمالي المبيعات' : 'Ventes Totales'}
              value={formatPrice(stats?.total_sales ?? 0, lang)}
              icon={<DollarSign size={20} />}
              color="text-leather-600"
              bg="bg-leather-100"
            />
            <StatCard
              label={lang === 'ar' ? 'مبيعات اليوم' : "Ventes Auj."}
              value={formatPrice(stats?.today_sales ?? 0, lang)}
              icon={<TrendingUp size={20} />}
              color="text-gold-600"
              bg="bg-amber-50"
            />
            <StatCard
              label={lang === 'ar' ? 'إجمالي الطلبات' : 'Total Commandes'}
              value={String(stats?.total_orders ?? 0)}
              icon={<ShoppingCart size={20} />}
              color="text-blue-600"
              bg="bg-blue-50"
              sub={`${stats?.pending_orders ?? 0} ${lang === 'ar' ? 'معلقة' : 'en attente'}`}
            />
            <StatCard
              label={lang === 'ar' ? 'الطلبات المعلقة' : 'En Attente'}
              value={String(stats?.pending_orders ?? 0)}
              icon={<Clock size={20} />}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <StatCard
              label={lang === 'ar' ? 'إجمالي العملاء' : 'Total Clients'}
              value={String(stats?.total_customers ?? 0)}
              icon={<Users size={20} />}
              color="text-purple-600"
              bg="bg-purple-50"
              sub={`+${stats?.new_customers_today ?? 0} ${lang === 'ar' ? 'اليوم' : "aujourd'hui"}`}
            />
          </div>
        )}

        {/* Chart + Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales chart */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-leather-100 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-leather-700 mb-4">
              {lang === 'ar' ? 'المبيعات – آخر 7 أيام' : 'Ventes – 7 derniers jours'}
            </h2>
            {isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <BarChart data={stats?.daily_sales ?? []} />
            )}
          </div>

          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-leather-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-leather-50">
              <h2 className="text-sm font-semibold text-leather-700">
                {lang === 'ar' ? 'آخر الطلبات' : 'Dernières Commandes'}
              </h2>
              <Link
                to="/admin/orders"
                className="text-xs text-leather-500 hover:text-leather-700 flex items-center gap-1 transition-colors"
              >
                {lang === 'ar' ? 'عرض الكل' : 'Voir tout'}
                <ArrowUpRight size={12} />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-10 text-center text-leather-400 text-sm">
                {lang === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-leather-50 bg-leather-50/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">
                        {lang === 'ar' ? 'المرجع' : 'Réf'}
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">
                        {lang === 'ar' ? 'العميل' : 'Client'}
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">
                        {lang === 'ar' ? 'المجموع' : 'Total'}
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">
                        {lang === 'ar' ? 'الحالة' : 'Statut'}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-leather-500 uppercase tracking-wide">
                        {lang === 'ar' ? 'التاريخ' : 'Date'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-leather-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-leather-50/40 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-leather-600 font-medium">
                          {order.order_ref}
                        </td>
                        <td className="px-3 py-3 text-leather-700">
                          {(order.customer as { name: string } | null)?.name ?? '—'}
                        </td>
                        <td className="px-3 py-3 font-medium text-leather-800">
                          {formatPrice(order.total, lang)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-leather-400 text-xs whitespace-nowrap">
                          {formatDate(order.created_at!, lang)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
