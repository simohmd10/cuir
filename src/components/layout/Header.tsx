import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

/* ─────────────────────────────────────────
   Nav link definitions
───────────────────────────────────────── */
const navLinks = [
  { key: 'home'    as const, path: '/'        },
  { key: 'shop'    as const, path: '/shop'    },
  { key: 'about'   as const, path: '/about'   },
  { key: 'contact' as const, path: '/contact' },
  { key: 'faq'     as const, path: '/faq'     },
] as const;

/* ─────────────────────────────────────────
   Shared ease
───────────────────────────────────────── */
const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/* ─────────────────────────────────────────
   Motion variants — fullscreen overlay
───────────────────────────────────────── */
const overlayVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: EASE,
      // stagger items out before fading overlay
      when: 'afterChildren' as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.12 + i * 0.09,
      ease: EASE,
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.28,
      delay: i * 0.04,
      ease: EASE,
    },
  }),
};

const bottomVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: 0.52,
      ease: EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: EASE },
  },
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function Header() {
  const { lang, setLang, t, dir } = useLanguage();
  const { totalItems } = useCart();
  const { isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── rAF-throttled scroll listener ── */
  const rafRef = useRef<number | null>(null);
  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrolled(window.scrollY > 20);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  /* ── Close overlay on route change ── */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* ── Lock body scroll while overlay is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  /* ── Dynamic colour tokens (transparent vs scrolled) ── */
  const textBase    = scrolled ? 'text-ink'       : 'text-cream-50';
  const textMuted   = scrolled ? 'text-ink/60'    : 'text-cream-50/70';
  const textHover   = scrolled ? 'hover:text-ink' : 'hover:text-cream-50';
  const logoSubClr  = scrolled ? 'text-camel'     : 'text-camel-200';

  /* The label shown on the language toggle button is always the OTHER language */
  const langLabel = lang === 'ar' ? 'Français' : 'العربية';

  return (
    <>
      {/* ════════════════════════════════════
          FIXED HEADER BAR
      ════════════════════════════════════ */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 h-16',
          'transition-all duration-[600ms] ease-[var(--ease-luxury)]',
          scrolled
            ? [
                'bg-cream-100/95 backdrop-blur-md',
                'border-b border-cream-400',
                'shadow-[0_1px_24px_rgba(28,28,28,0.06)]',
              ].join(' ')
            : 'bg-transparent border-b border-transparent',
        ].join(' ')}
      >
        <div
          className="h-full container-luxury flex items-center justify-between gap-4"
          dir={dir}
        >

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex-shrink-0 flex flex-col items-start leading-none"
            aria-label="CUIR — accueil"
          >
            <span
              className={[
                'font-display font-light tracking-[0.15em] text-xl md:text-2xl leading-none',
                'transition-colors duration-[600ms] ease-[var(--ease-luxury)]',
                textBase,
              ].join(' ')}
            >
              CUIR
            </span>
            <span
              className={[
                'font-body text-[9px] tracking-[0.30em] uppercase leading-none mt-[3px]',
                'transition-colors duration-[600ms] ease-[var(--ease-luxury)]',
                logoSubClr,
              ].join(' ')}
            >
              MAROC
            </span>
          </Link>

          {/* ── Desktop centred nav ── */}
          <nav
            className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
            aria-label={lang === 'ar' ? 'التنقل الرئيسي' : 'Navigation principale'}
          >
            {navLinks.map(({ key, path }) => {
              const active = isActive(path);
              return (
                <Link
                  key={key}
                  to={path}
                  className={[
                    'relative text-[11px] tracking-[0.15em] uppercase font-body font-light',
                    'transition-colors duration-400 ease-[var(--ease-luxury)]',
                    active
                      ? 'text-camel'
                      : scrolled
                        ? 'text-ink/65 hover:text-ink'
                        : 'text-cream-50/72 hover:text-cream-50',
                  ].join(' ')}
                >
                  {t(key)}
                  {/* Active underline pill */}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-camel" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right-side actions ── */}
          <div className="flex items-center gap-3 md:gap-4 ms-auto lg:ms-0">

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className={[
                'hidden sm:block font-body font-light text-[11px] tracking-[0.12em] uppercase',
                'transition-colors duration-400 ease-[var(--ease-luxury)]',
                textMuted, textHover,
              ].join(' ')}
              aria-label={lang === 'ar' ? 'Changer en français' : 'التبديل إلى العربية'}
            >
              {langLabel}
            </button>

            {/* Admin settings shortcut */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={[
                  'hidden sm:flex items-center justify-center w-8 h-8',
                  'transition-colors duration-400 ease-[var(--ease-luxury)]',
                  textMuted, textHover,
                ].join(' ')}
                aria-label={t('admin')}
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            )}

            {/* Cart icon + badge */}
            <Link
              to="/cart"
              className={[
                'relative flex items-center justify-center w-9 h-9',
                'transition-colors duration-400 ease-[var(--ease-luxury)]',
                textMuted, textHover,
              ].join(' ')}
              aria-label={`${t('cart')} (${totalItems})`}
            >
              <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span
                  className={[
                    'absolute -top-0.5 -end-0.5',
                    'min-w-[17px] h-[17px] px-1',
                    'bg-camel text-cream-50 rounded-full',
                    'text-[9px] font-body font-medium leading-none',
                    'flex items-center justify-center',
                  ].join(' ')}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger — always visible */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className={[
                'flex items-center justify-center w-9 h-9',
                'transition-colors duration-400 ease-[var(--ease-luxury)]',
                textMuted, textHover,
              ].join(' ')}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls="nav-overlay"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════
          FULLSCREEN OVERLAY NAVIGATION
      ════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="nav-overlay"
            key="nav-overlay"
            className="fixed inset-0 z-[999] bg-ink flex flex-col"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            dir={dir}
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Menu de navigation'}
          >

            {/* ── Top bar: logo + close ── */}
            <div className="flex items-center justify-between px-6 md:px-12 h-16 flex-shrink-0 border-b border-cream-50/8">
              {/* White logo */}
              <Link
                to="/"
                className="flex flex-col items-start leading-none"
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-display font-light tracking-[0.15em] text-xl text-cream-50 leading-none">
                  CUIR
                </span>
                <span className="font-body text-[9px] tracking-[0.30em] uppercase text-camel leading-none mt-[3px]">
                  MAROC
                </span>
              </Link>

              {/* Close button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-10 h-10 text-cream-50/60 hover:text-cream-50 transition-colors duration-300"
                aria-label={lang === 'ar' ? 'إغلاق' : 'Fermer'}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* ── Staggered nav items ── */}
            <nav
              className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24"
              aria-label={lang === 'ar' ? 'قائمة رئيسية' : 'Navigation principale'}
            >
              {navLinks.map(({ key, path }, i) => {
                const active = isActive(path);
                return (
                  <motion.div
                    key={key}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      to={path}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        'block py-4 border-b border-cream-50/10',
                        'transition-colors duration-400 ease-[var(--ease-luxury)]',
                        'font-light leading-[1.1]',
                        active ? 'text-camel' : 'text-cream-50 hover:text-camel',
                        lang === 'ar'
                          ? 'font-arabic text-[clamp(2rem,6vw,3.5rem)]'
                          : 'font-display text-[clamp(2.5rem,7vw,4rem)]',
                      ].join(' ')}
                    >
                      {t(key)}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Admin link in overlay */}
              {isAdmin && (
                <motion.div
                  custom={navLinks.length}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={[
                      'block py-4 border-b border-cream-50/10',
                      'text-camel/65 hover:text-camel',
                      'transition-colors duration-400 ease-[var(--ease-luxury)]',
                      'font-light leading-[1.1]',
                      lang === 'ar'
                        ? 'font-arabic text-[clamp(1.5rem,4.5vw,2.5rem)]'
                        : 'font-display text-[clamp(1.75rem,5vw,3rem)]',
                    ].join(' ')}
                  >
                    {t('admin')}
                  </Link>
                </motion.div>
              )}
            </nav>

            {/* ── Bottom bar: lang + logout + wordmark ── */}
            <motion.div
              variants={bottomVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={[
                'flex-shrink-0 px-8 md:px-16 lg:px-24 pb-8 pt-6',
                'border-t border-cream-50/8',
                'flex flex-wrap items-center justify-between gap-4',
              ].join(' ')}
            >
              {/* Language toggle + logout */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    setLang(lang === 'ar' ? 'fr' : 'ar');
                    setMenuOpen(false);
                  }}
                  className="font-body font-light text-xs tracking-[0.18em] uppercase text-cream-50/55 hover:text-camel transition-colors duration-300"
                >
                  {langLabel}
                </button>

                {isAdmin && (
                  <button
                    onClick={handleLogout}
                    className="font-body font-light text-xs tracking-[0.18em] uppercase text-cream-50/35 hover:text-cream-50/65 transition-colors duration-300"
                  >
                    {t('logout')}
                  </button>
                )}
              </div>

              {/* Brand wordmark */}
              <p className="font-body font-light text-[11px] tracking-[0.22em] uppercase text-cream-50/28 select-none">
                {lang === 'ar' ? 'كوير | CUIR' : 'CUIR | كوير'}
              </p>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
