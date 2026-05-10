import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import NavOverlay from './NavOverlay';
import { preloadRoute } from '../../lib/routePreload';

const NAV_LINKS = [
  { key: 'home' as const, href: '/' },
  { key: 'shop' as const, href: '/shop' },
  { key: 'about' as const, href: '/about' },
  { key: 'contact' as const, href: '/contact' },
];

export default function Header() {
  const { t, lang, setLang } = useLanguage();
  const { totalItems } = useCart();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rafRef = useRef<number>(0);

  // Throttled scroll listener via rAF
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled && !menuOpen;

  const textCls = transparent ? 'text-cream-100' : 'text-ink';
  const mutedCls = transparent ? 'text-cream-100/60' : 'text-ink/45';
  const hoverCls = transparent ? 'hover:text-cream-100/90' : 'hover:text-camel';

  return (
    <>
      <header
        className={[
          'fixed top-0 inset-x-0 z-50 h-16',
          'transition-all duration-500',
          transparent
            ? 'bg-transparent border-b border-transparent'
            : 'bg-cream-100/96 backdrop-blur-[6px] border-b border-cream-300',
        ].join(' ')}
      >
        <div className="container-luxury h-full flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 select-none" aria-label="CUIR — Accueil">
            <span className={`font-display font-light text-xl tracking-[0.14em] transition-colors duration-500 ${textCls}`}>
              CUIR
            </span>
            <span className="block text-[8px] tracking-[0.28em] uppercase text-camel mt-0.5">
              MAROC
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigation">
            {NAV_LINKS.map(({ key, href }) => {
              const active = location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  onMouseEnter={() => preloadRoute(href as '/' | '/shop' | '/about' | '/contact')}
                  onFocus={() => preloadRoute(href as '/' | '/shop' | '/about' | '/contact')}
                  className={[
                    'text-[11px] tracking-[0.2em] uppercase font-body relative group',
                    'transition-colors duration-300',
                    active ? 'text-camel' : `${mutedCls} ${hoverCls}`,
                  ].join(' ')}
                >
                  {t(key)}
                  <span className={[
                    'absolute -bottom-0.5 start-0 h-px bg-camel',
                    'transition-[width] duration-400 ease-out',
                    active ? 'w-full' : 'w-0 group-hover:w-full',
                  ].join(' ')} />
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`text-[11px] tracking-[0.2em] uppercase font-body transition-colors duration-300 ${mutedCls} ${hoverCls}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className={`hidden sm:flex text-[10px] tracking-[0.18em] uppercase px-3 py-2 font-body transition-colors duration-300 ${mutedCls} ${hoverCls}`}
            >
              {lang === 'ar' ? 'FR' : 'AR'}
            </button>

            <Link
              to="/cart"
              onMouseEnter={() => preloadRoute('/cart')}
              onFocus={() => preloadRoute('/cart')}
              className={`relative flex items-center justify-center w-10 h-10 transition-colors duration-300 ${textCls} ${hoverCls}`}
              aria-label={`${t('cart')} — ${totalItems}`}
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -end-0.5 w-[18px] h-[18px] rounded-full bg-camel text-cream-100 text-[9px] font-body font-medium flex items-center justify-center tabular-nums leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="nav-overlay"
              className={`flex items-center justify-center w-10 h-10 transition-colors duration-300 ${textCls} ${hoverCls}`}
            >
              <Menu size={19} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <NavOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
