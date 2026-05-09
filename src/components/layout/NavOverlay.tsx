import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onExited?: () => void;
}

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/*
 * Exit is intentionally fast and independent of children.
 * 'when: afterChildren' was removed — it was causing a ~0.85s exit during
 * which the overlay blocked all touch events on mobile.
 */
const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
  exit:    { opacity: 0, transition: { duration: 0.22, ease: EASE } },
};

const listVariants = {
  hidden:  {},                    // defined so initial="hidden" has a target
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
  exit:    { transition: { staggerChildren: 0 } }, // no stagger on close
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit:    { opacity: 0, y: 8,  transition: { duration: 0.15 } },
};

export default function NavOverlay({ isOpen, onClose, onExited }: NavOverlayProps) {
  const { t, lang, setLang, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const savedScrollY = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    savedScrollY.current = window.scrollY;
    const { style } = document.body;
    style.overflow = 'hidden';
    style.position = 'fixed';
    style.inset = '0';
    style.top = `-${savedScrollY.current}px`;

    return () => {
      style.overflow = '';
      style.position = '';
      style.inset = '';
      style.top = '';
      window.scrollTo(0, savedScrollY.current);
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const links = [
    { label: t('home'), href: '/' },
    { label: t('shop'), href: '/shop' },
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('faq'), href: '/faq' },
  ];

  if (isAdmin) links.push({ label: lang === 'ar' ? 'الإدارة' : 'Admin', href: '/admin/dashboard' });

  return (
    <div
      id="nav-overlay"
      role="dialog"
      aria-modal={isOpen ? 'true' : 'false'}
      aria-hidden={!isOpen}
      aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Menu de navigation'}
      className={[
        'fixed inset-0 z-[999] bg-ink flex flex-col',
        'transition-opacity duration-200 ease-out',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      dir={dir}
    >
      <AnimatePresence
        onExitComplete={() => {
          if (!isOpen) onExited?.();
        }}
      >
        {isOpen && (
          <motion.div
            id="nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Menu de navigation'}
            className="absolute inset-0 bg-ink flex flex-col"
            dir={dir}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
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

      <nav className="flex-1 flex flex-col justify-center px-6 sm:px-10">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                onClick={onClose}
                className={['nav-item block', location.pathname === link.href ? 'text-camel' : 'text-cream-100'].join(' ')}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 sm:px-10 py-6 border-t border-cream-100/8 flex items-center justify-between">
        <button
          onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
          className="text-xs tracking-[0.2em] uppercase text-cream-100/50 hover:text-camel transition-colors duration-200"
        >
          {lang === 'ar' ? 'Français' : 'العربية'}
        </button>
        <span className="text-[10px] tracking-[0.2em] text-cream-100/20 select-none">كوير · CUIR · 2026</span>
      </div>
    </div>
  );
}
