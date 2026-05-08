import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  Globe,
  User,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { key: 'home' as const, path: '/' },
  { key: 'shop' as const, path: '/shop' },
  { key: 'about' as const, path: '/about' },
  { key: 'contact' as const, path: '/contact' },
  { key: 'faq' as const, path: '/faq' },
] as const;

export default function Header() {
  const { lang, setLang, t, dir } = useLanguage();
  const { totalItems } = useCart();
  const { isAdmin, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <header
        className={[
          'fixed top-0 inset-x-0 z-50 bg-white transition-shadow duration-300',
          scrolled ? 'shadow-md' : 'shadow-sm',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

          {/* Hamburger — mobile */}
          <button
            className="lg:hidden p-2 -ms-2 rounded-lg text-leather-600 hover:bg-leather-50 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t('contact') : t('home')}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Cuir — Accueil"
          >
            <span className="font-display text-2xl font-bold text-leather-500 tracking-tight leading-none">
              Cuir
            </span>
            <span className="hidden sm:block w-px h-5 bg-leather-200" />
            <span className="hidden sm:block font-arabic text-xs text-leather-400 leading-none">
              كوير
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" dir={dir}>
            {navLinks.map(({ key, path }) => (
              <Link
                key={key}
                to={path}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                  lang === 'ar' ? 'font-arabic' : 'font-display',
                  isActive(path)
                    ? 'text-leather-600 bg-leather-50'
                    : 'text-gray-600 hover:text-leather-600 hover:bg-leather-50',
                ].join(' ')}
              >
                {t(key)}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gold-600 hover:bg-amber-50 transition-colors duration-150"
              >
                {t('admin')}
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 ms-auto">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-leather-600 hover:bg-leather-50 transition-colors duration-150"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:block text-xs">{t('language')}</span>
            </button>

            {/* User / logout */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-leather-600 hover:bg-leather-50 transition-colors duration-150"
                aria-label={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            {!user && (
              <Link
                to="/admin/login"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-leather-600 hover:bg-leather-50 transition-colors duration-150"
                aria-label={t('login')}
              >
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-leather-600 hover:bg-leather-50 transition-colors duration-150"
              aria-label={`${t('cart')} (${totalItems})`}
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] bg-leather-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-down panel */}
            <motion.div
              className="fixed top-16 inset-x-0 z-40 bg-white border-b border-leather-100 shadow-xl lg:hidden"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <nav className="flex flex-col px-4 py-4 gap-1" dir={dir}>
                {navLinks.map(({ key, path }) => (
                  <Link
                    key={key}
                    to={path}
                    className={[
                      'px-4 py-3 rounded-xl text-base font-medium transition-colors duration-150',
                      lang === 'ar' ? 'font-arabic text-right' : 'font-display',
                      isActive(path)
                        ? 'text-leather-600 bg-leather-50 font-semibold'
                        : 'text-gray-700 hover:bg-leather-50 hover:text-leather-600',
                    ].join(' ')}
                  >
                    {t(key)}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-3 rounded-xl text-base font-medium text-gold-600 hover:bg-amber-50 transition-colors"
                  >
                    {t('admin')}
                  </Link>
                )}

                <div className="mt-2 pt-2 border-t border-leather-100 flex items-center justify-between px-4">
                  {/* Language switch */}
                  <button
                    onClick={() => {
                      setLang(lang === 'ar' ? 'fr' : 'ar');
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm text-leather-600 font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    {t('language')}
                  </button>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="flex items-center gap-2 text-sm text-leather-600 font-medium"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t('cart')}
                    {totalItems > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 bg-leather-500 text-white text-[10px] font-bold rounded-full px-1">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer so content starts below the fixed header */}
      <div className="h-16" />
    </>
  );
}
