import { useState, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronRight, User, ShoppingBag, Heart, Phone, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

interface SubItem {
  labelFr: string;
  labelAr: string;
  href: string;
}

interface NavCategory {
  id: string;
  labelFr: string;
  labelAr: string;
  href: string;
  badge?: 'NEW' | string;
  sub?: SubItem[];
}

const CATEGORIES: NavCategory[] = [
  {
    id: 'new',
    labelFr: 'Nouveautés',
    labelAr: 'الوافد الجديد',
    href: '/shop?sort=newest',
    badge: 'NEW',
  },
  {
    id: 'handbags',
    labelFr: 'Sacs & Maroquinerie',
    labelAr: 'حقائب ومحافظ',
    href: '/shop?category=handbags',
    sub: [
      { labelFr: 'Sacs à Main',         labelAr: 'حقائب اليد',       href: '/shop?category=sacs-a-main' },
      { labelFr: 'Cabas & Totes',        labelAr: 'حقائب الكتف',     href: '/shop?category=cabas-totes' },
      { labelFr: 'Pochettes & Clutches', labelAr: 'المحافظ الصغيرة', href: '/shop?category=pochettes' },
    ],
  },
  {
    id: 'travel',
    labelFr: 'Bagagerie Cuir',
    labelAr: 'حقائب السفر',
    href: '/shop?category=travel-bags',
    sub: [
      { labelFr: 'Sacs de Voyage',  labelAr: 'حقائب الرحلات',  href: '/shop?category=sacs-voyage' },
      { labelFr: 'Sacs Week-end',   labelAr: 'حقائب العطلة',   href: '/shop?category=sacs-weekend' },
    ],
  },
  {
    id: 'briefcases',
    labelFr: 'Mallettes & Sacoches',
    labelAr: 'حقائب الأعمال',
    href: '/shop?category=briefcases',
    sub: [
      { labelFr: 'Mallettes Business', labelAr: 'حقائب المكتب', href: '/shop?category=mallettes' },
      { labelFr: 'Sacoches',           labelAr: 'الحقائب الناعمة', href: '/shop?category=sacoches' },
    ],
  },
  {
    id: 'accessories',
    labelFr: 'Accessoires & Essentiels',
    labelAr: 'الإكسسوارات',
    href: '/shop?category=accessories',
    sub: [
      { labelFr: 'Ceintures Cuir',             labelAr: 'الأحزمة',          href: '/shop?category=belts' },
      { labelFr: 'Petite Maroquinerie',       labelAr: 'إكسسوارات صغيرة', href: '/shop?category=petite-maroquinerie' },
      { labelFr: 'Porte-Cartes & Passeports', labelAr: 'حاملات البطاقات', href: '/shop?category=card-holders' },
    ],
  },
  {
    id: 'gifts',
    labelFr: 'Coffrets Cadeaux',
    labelAr: 'صناديق الهدايا',
    href: '/shop?category=gift-sets',
    badge: 'NEW',
  },
  {
    id: 'limited',
    labelFr: 'Collection Limitée',
    labelAr: 'الإصدارات المحدودة',
    href: '/shop?category=limited-collection',
  },
];

const PAGE_LINKS = [
  { labelFr: 'Notre Atelier',    labelAr: 'حرفتنا',            href: '/about'   },
  { labelFr: 'Nous contacter',   labelAr: 'اتصل بنا',          href: '/contact' },
  { labelFr: 'FAQ',              labelAr: 'الأسئلة الشائعة',   href: '/faq'     },
];

// ─── Accordion row ─────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  isAr,
  onClose,
}: {
  cat: NavCategory;
  isAr: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const hasSub = !!cat.sub?.length;
  const label  = isAr ? cat.labelAr : cat.labelFr;
  const badge  = cat.badge;

  const subRef = useRef<HTMLUListElement>(null);

  const toggle = () => {
    if (!hasSub) return;
    setOpen((v) => !v);
  };

  return (
    <li className="border-b border-ink/[0.07]">
      {/* Main row */}
      <div className="flex items-center">
        {/* Tappable label — navigates to category */}
        <Link
          to={cat.href}
          onClick={onClose}
          className={[
            'flex-1 flex items-center gap-3 py-[18px] px-6',
            'text-[15px] font-light text-ink tracking-[0.01em]',
            'transition-colors duration-200 hover:text-camel',
            isAr ? 'font-arabic text-right flex-row-reverse' : '',
          ].join(' ')}
        >
          <span>{label}</span>
          {badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] tracking-[0.16em] uppercase font-body text-camel border border-camel/60 leading-none">
              {t('newBadge')}
            </span>
          )}
        </Link>

        {/* Expand chevron — only when sub-items exist */}
        {hasSub && (
          <button
            onClick={toggle}
            aria-expanded={open}
            aria-label={isAr ? 'توسيع' : 'Développer'}
            className={[
              'flex-none flex items-center justify-center w-12 h-full py-[18px] text-ink/35',
              'transition-all duration-300 hover:text-ink',
            ].join(' ')}
          >
            <ChevronRight
              size={15}
              strokeWidth={1.5}
              className={[
                'transition-transform duration-300',
                open ? (isAr ? '-rotate-90' : 'rotate-90') : (isAr ? 'rotate-180' : ''),
              ].join(' ')}
            />
          </button>
        )}
      </div>

      {/* Sub-items — CSS max-height accordion */}
      {hasSub && (
        <ul
          ref={subRef}
          className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ maxHeight: open ? `${(cat.sub!.length * 48) + 16}px` : '0px' }}
        >
          {cat.sub!.map((sub) => (
            <li key={sub.href + (isAr ? sub.labelAr : sub.labelFr)}>
              <Link
                to={sub.href}
                onClick={onClose}
                className={[
                  'flex items-center py-3 text-[13px] text-ink/55 hover:text-camel',
                  'transition-colors duration-200 tracking-[0.01em]',
                  isAr ? 'font-arabic pr-10 pl-6 justify-end' : 'pl-10 pr-6',
                ].join(' ')}
              >
                {isAr ? sub.labelAr : sub.labelFr}
              </Link>
            </li>
          ))}
          <li className="h-3" aria-hidden="true" />
        </ul>
      )}
    </li>
  );
}

// ─── NavOverlay ─────────────────────────────────────────────────────────────────

interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavOverlay({ isOpen, onClose }: NavOverlayProps) {
  const { lang, setLang, dir, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const isAr = lang === 'ar';
  const savedScrollY = useRef(0);
  const shouldRestoreScroll = useRef(true);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      event.preventDefault();
      shouldRestoreScroll.current = false;
      onClose();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onClose();
  };

  // ── iOS-safe scroll lock ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    shouldRestoreScroll.current = true;
    savedScrollY.current = window.scrollY;
    const { style } = document.body;
    style.overflow  = 'hidden';
    style.position  = 'fixed';
    style.top       = `-${savedScrollY.current}px`;
    style.width     = '100%';
    return () => {
      style.overflow  = '';
      style.position  = '';
      style.top       = '';
      style.width     = '';
      if (shouldRestoreScroll.current) {
        window.scrollTo(0, savedScrollY.current);
      }
    };
  }, [isOpen]);

  // ── Close on route change ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) shouldRestoreScroll.current = false;
    onClose();
  }, [location.pathname]); // eslint-disable-line

  // ── Keyboard close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    /* Backdrop */
    <div
      aria-hidden={!isOpen}
      className={[
        'fixed inset-0 z-[998]',
        'transition-opacity duration-400',
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      style={{ backgroundColor: 'rgba(28,28,28,0.38)' }}
      onClick={onClose}
    >
      {/* Panel — slides in from the start edge */}
      <div
        id="nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'قائمة التنقل' : 'Menu de navigation'}
        dir={dir}
        onClick={(e) => e.stopPropagation()}
        className={[
          'absolute inset-y-0 flex flex-col bg-white shadow-2xl',
          'transition-transform duration-[420ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          'w-[88vw] max-w-sm',
          // RTL: slides from the right; LTR: slides from the left
          dir === 'rtl' ? 'right-0' : 'left-0',
          isOpen
            ? 'translate-x-0'
            : dir === 'rtl'
            ? 'translate-x-full'
            : '-translate-x-full',
        ].join(' ')}
      >

        {/* ── Top bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-ink/[0.07] flex-shrink-0">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Fermer / إغلاق"
            className="w-9 h-9 flex items-center justify-center text-ink/50 hover:text-ink transition-colors duration-200"
          >
            <X size={18} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link to="/" onClick={handleLogoClick} className="select-none text-center">
            <span className="block font-display font-light text-lg text-ink tracking-[0.14em]">
              CUIR
            </span>
            <span className="block text-[7px] tracking-[0.28em] uppercase text-camel leading-none">
              MAROC
            </span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={onClose}
            aria-label={isAr ? `السلة — ${totalItems}` : `Panier — ${totalItems}`}
            className="relative w-9 h-9 flex items-center justify-center text-ink/60 hover:text-ink transition-colors duration-200"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] rounded-full bg-camel text-white text-[9px] font-body font-medium flex items-center justify-center tabular-nums leading-none">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Categories */}
          <ul>
            {CATEGORIES.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} isAr={isAr} onClose={onClose} />
            ))}
          </ul>

          {/* Divider */}
          <div className="my-2 mx-6 h-px bg-ink/[0.07]" aria-hidden="true" />

          {/* Page links */}
          <ul>
            {PAGE_LINKS.map((link) => (
              <li key={link.href} className="border-b border-ink/[0.07]">
                <Link
                  to={link.href}
                  onClick={onClose}
                  className={[
                    'block py-[15px] px-6 text-[13px] text-ink/50',
                    'tracking-[0.08em] uppercase font-body',
                    'hover:text-camel transition-colors duration-200',
                    isAr ? 'text-right font-arabic normal-case tracking-normal text-[14px]' : '',
                  ].join(' ')}
                >
                  {isAr ? link.labelAr : link.labelFr}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li className="border-b border-ink/[0.07]">
                <Link
                  to="/admin/dashboard"
                  onClick={onClose}
                  className="block py-[15px] px-6 text-[13px] text-ink/40 tracking-[0.08em] uppercase font-body hover:text-camel transition-colors duration-200"
                >
                  {t('admin')}
                </Link>
              </li>
            )}
          </ul>

          {/* Spacer */}
          <div className="h-3" aria-hidden="true" />
        </div>

        {/* ── Bottom utility section ────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-ink/[0.08]">
          <ul>
            {/* Login / Profile → Contact until auth pages exist */}
            <li>
              <Link
                to="/contact"
                onClick={onClose}
                className={[
                  'flex items-center gap-4 px-6 py-4',
                  'text-[13px] text-ink/70 hover:text-ink transition-colors duration-200',
                  isAr ? 'flex-row-reverse' : '',
                ].join(' ')}
              >
                <User size={17} strokeWidth={1.5} className="flex-none text-ink/40" />
                <span className={isAr ? 'font-arabic text-[14px]' : 'font-body'}>
                  {t('contact')}
                </span>
              </Link>
            </li>

            {/* Cart */}
            <li>
              <Link
                to="/cart"
                onClick={onClose}
                className={[
                  'flex items-center gap-4 px-6 py-4',
                  'text-[13px] text-ink/70 hover:text-ink transition-colors duration-200',
                  isAr ? 'flex-row-reverse' : '',
                ].join(' ')}
              >
                <ShoppingBag size={17} strokeWidth={1.5} className="flex-none text-ink/40" />
                <span className={[
                  'flex-1',
                  isAr ? 'font-arabic text-[14px] text-right' : 'font-body',
                ].join(' ')}>
                  {t('cart')}
                </span>
                {totalItems > 0 && (
                  <span className="flex-none text-[11px] font-body text-camel tabular-nums">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>

            {/* Shop / Collection */}
            <li>
              <Link
                to="/shop"
                onClick={onClose}
                className={[
                  'flex items-center gap-4 px-6 py-4',
                  'text-[13px] text-ink/70 hover:text-ink transition-colors duration-200',
                  isAr ? 'flex-row-reverse' : '',
                ].join(' ')}
              >
                <Heart size={17} strokeWidth={1.5} className="flex-none text-ink/40" />
                <span className={isAr ? 'font-arabic text-[14px]' : 'font-body'}>
                  {t('allProducts')}
                </span>
              </Link>
            </li>

            {/* Contact */}
            <li>
              <Link
                to="/contact"
                onClick={onClose}
                className={[
                  'flex items-center gap-4 px-6 py-4',
                  'text-[13px] text-ink/70 hover:text-ink transition-colors duration-200',
                  isAr ? 'flex-row-reverse' : '',
                ].join(' ')}
              >
                <Phone size={17} strokeWidth={1.5} className="flex-none text-ink/40" />
                <span className={isAr ? 'font-arabic text-[14px]' : 'font-body'}>
                  {t('contact')}
                </span>
              </Link>
            </li>

            {/* Language */}
            <li className="border-t border-ink/[0.06]">
              <button
                onClick={() => setLang(isAr ? 'fr' : 'ar')}
                className={[
                  'w-full flex items-center gap-4 px-6 py-4',
                  'text-[13px] text-ink/50 hover:text-ink transition-colors duration-200',
                  isAr ? 'flex-row-reverse' : '',
                ].join(' ')}
              >
                <Globe size={17} strokeWidth={1.5} className="flex-none text-ink/35" />
                <span className="font-body flex-1 text-start">
                  {t('language')}
                </span>
                <ChevronRight size={13} strokeWidth={1.5} className="flex-none text-ink/25" />
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
