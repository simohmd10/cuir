import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
      when: 'afterChildren',
    },
  },
};

const listVariants = {
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: 16,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function NavOverlay({ isOpen, onClose }: NavOverlayProps) {
  const { t, lang, setLang, dir } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on route change
  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line

  const links = [
    { label: t('home'), href: '/' },
    { label: t('shop'), href: '/shop' },
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
    { label: t('faq'), href: '/faq' },
  ];

  if (isAdmin) {
    links.push({ label: lang === 'ar' ? 'الإدارة' : 'Admin', href: '/admin/dashboard' });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="nav-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'ar' ? 'قائمة التنقل' : 'Menu de navigation'}
          className="fixed inset-0 bg-ink z-[999] flex flex-col"
          dir={dir}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Top bar */}
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
              className="w-10 h-10 flex items-center justify-center text-cream-100/60 hover:text-cream-100 transition-colors duration-300"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-center px-6 sm:px-10">
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-0"
            >
              {links.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
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
                </motion.li>
              ))}
            </motion.ul>
          </nav>

          {/* Bottom bar */}
          <div className="px-6 sm:px-10 py-6 border-t border-cream-100/8 flex items-center justify-between">
            <button
              onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
              className="text-xs tracking-[0.2em] uppercase text-cream-100/50 hover:text-camel transition-colors duration-300"
            >
              {lang === 'ar' ? 'Français' : 'العربية'}
            </button>
            <span className="text-[10px] tracking-[0.2em] text-cream-100/20 select-none">
              كوير · CUIR · 2026
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
