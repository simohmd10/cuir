import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavOverlay({ isOpen, onClose }: NavOverlayProps) {
  const { t, lang, setLang, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const savedScrollY = useRef(0);

  /*
   * iOS-safe scroll lock.
   * overflow:hidden alone doesn't prevent scroll on iOS Safari.
   * position:fixed + negative top keeps the visual position.
   */
  useEffect(() => {
    if (!isOpen) return;

    savedScrollY.current = window.scrollY;
    const { style } = document.body;
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.top = `-${savedScrollY.current}px`;
    style.width = '100%';

    return () => {
      style.overflow = '';
      style.position = '';
      style.top = '';
      style.width = '';
      window.scrollTo(0, savedScrollY.current);
    };
  }, [isOpen]);

  // Close when the route changes (user tapped a nav link)
  useEffect(() => {
    onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const links = [
    { label: t('home'),    href: '/' },
    { label: t('shop'),    href: '/shop' },
    { label: t('about'),   href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('faq'),     href: '/faq' },
  ];
  if (isAdmin) {
    links.push({ label: lang === 'ar' ? 'الإدارة' : 'Admin', href: '/admin/dashboard' });
  }

  return (
    /*
     * pointer-events:none when closed so the page is interactive immediately
     * after close — the 200ms fade-out is purely visual.
     */
    <div
      id="nav-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Menu de navigation'}
      aria-hidden={!isOpen}
      className={[
        'fixed inset-0 z-[999] bg-ink flex flex-col',
        'transition-opacity duration-200 ease-out',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      dir={dir}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-cream-100/8">
        <Link to="/" onClick={onClose} className="select-none">
          <span className="font-display font-light text-2xl text-cream-100 tracking-[0.12em]">
            CUIR
          </span>
          <span className="block text-[8px] tracking-[0.28em] uppercase text-camel mt-0.5">
            MAROC
          </span>
        </Link>

        <button
          onClick={onClose}
          aria-label="Fermer / إغلاق"
          className="w-10 h-10 flex items-center justify-center text-cream-100/60 hover:text-cream-100 transition-colors duration-200"
        >
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 flex flex-col justify-center px-6 sm:px-10">
        <ul className="space-y-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={onClose}
                className={[
                  'nav-item block',
                  location.pathname === link.href ? 'text-camel' : 'text-cream-100',
                ].join(' ')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Bottom bar ── */}
      <div className="px-6 sm:px-10 py-6 border-t border-cream-100/8 flex items-center justify-between">
        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="text-xs tracking-[0.2em] uppercase text-cream-100/50 hover:text-camel transition-colors duration-200"
        >
          {lang === 'ar' ? 'Français' : 'العربية'}
        </button>
        <span className="text-[10px] tracking-[0.2em] text-cream-100/20 select-none">
          كوير · CUIR · 2026
        </span>
      </div>
    </div>
  );
}
