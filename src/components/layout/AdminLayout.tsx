import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Ticket,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import type { TranslationKey } from '../../i18n';

interface NavItem {
  label: string;
  labelAr: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', labelAr: 'لوحة التحكم', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Products', labelAr: 'المنتجات', path: '/admin/products', icon: <Package size={18} /> },
  { label: 'Orders', labelAr: 'الطلبات', path: '/admin/orders', icon: <ShoppingCart size={18} /> },
  { label: 'Customers', labelAr: 'العملاء', path: '/admin/customers', icon: <Users size={18} /> },
  { label: 'Categories', labelAr: 'الفئات', path: '/admin/categories', icon: <Tag size={18} /> },
  { label: 'Coupons', labelAr: 'كوبونات', path: '/admin/coupons', icon: <Ticket size={18} /> },
  { label: 'Reviews', labelAr: 'التقييمات', path: '/admin/reviews', icon: <Star size={18} /> },
  { label: 'Settings', labelAr: 'الإعدادات', path: '/admin/settings', icon: <Settings size={18} /> },
];

interface SidebarContentProps {
  lang: 'ar' | 'fr';
  t: (key: TranslationKey) => string;
  user: { email?: string } | null | undefined;
  activePath: string;
  onNavClick: () => void;
  onSignOut: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ lang, t, user, activePath, onNavClick, onSignOut }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="px-6 py-6 border-b border-leather-200">
      <Link to="/admin/dashboard" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-leather-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm font-display">C</span>
        </div>
        <div>
          <p className="font-bold text-leather-800 text-sm font-display tracking-wide">CUIR</p>
          <p className="text-leather-400 text-xs">{t('adminPanelLabel')}</p>
        </div>
      </Link>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {navItems.map((item) => {
        const active = activePath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              active
                ? 'bg-leather-500 text-white shadow-sm'
                : 'text-leather-600 hover:bg-leather-50 hover:text-leather-800',
            ].join(' ')}
          >
            <span className={active ? 'text-white' : 'text-leather-400'}>{item.icon}</span>
            <span>{lang === 'ar' ? item.labelAr : item.label}</span>
            {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
          </Link>
        );
      })}
    </nav>

    {/* User / Sign out */}
    <div className="px-3 py-4 border-t border-leather-100">
      <div className="flex items-center gap-3 px-3 py-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-leather-200 flex items-center justify-center flex-shrink-0">
          <span className="text-leather-600 font-bold text-xs uppercase">
            {user?.email?.[0] ?? 'A'}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-leather-700 truncate">{user?.email}</p>
          <p className="text-xs text-leather-400">{t('adminUserLabel')}</p>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        <span>{t('logout')}</span>
      </button>
    </div>
  </div>
);

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth();
  const { lang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const sidebarProps: SidebarContentProps = {
    lang,
    t,
    user,
    activePath: location.pathname,
    onNavClick: () => setSidebarOpen(false),
    onSignOut: handleSignOut,
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="ltr">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-leather-100 flex-shrink-0">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-white z-50 lg:hidden flex flex-col border-r border-leather-100"
            >
              <SidebarContent {...sidebarProps} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-leather-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-leather-500 hover:bg-leather-50 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link
            to="/"
            target="_blank"
            className="text-xs text-leather-400 hover:text-leather-600 transition-colors hidden sm:block"
          >
            {t('viewStore')} {lang === 'ar' ? '←' : '→'}
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
