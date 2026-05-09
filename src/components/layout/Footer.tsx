import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '212600000000';

const QUICK_LINKS = [
  { labelFr: 'Accueil',   labelAr: 'الرئيسية',         path: '/' },
  { labelFr: 'Boutique',  labelAr: 'المتجر',            path: '/shop' },
  { labelFr: 'À propos',  labelAr: 'من نحن',            path: '/about' },
  { labelFr: 'Contact',   labelAr: 'التواصل',           path: '/contact' },
  { labelFr: 'FAQ',       labelAr: 'الأسئلة الشائعة',  path: '/faq' },
] as const;

const SERVICE_LINKS = [
  {
    labelFr: 'Suivi de commande',
    labelAr: 'تتبع الطلب',
    path: '/order-status',
  },
  {
    labelFr: 'Politique de retour',
    labelAr: 'سياسة الإرجاع',
    path: '/return-policy',
  },
  {
    labelFr: 'Politique de confidentialité',
    labelAr: 'سياسة الخصوصية',
    path: '/privacy-policy',
  },
  {
    labelFr: 'FAQ',
    labelAr: 'الأسئلة الشائعة',
    path: '/faq',
  },
] as const;

// ─── SectionHeading ───────────────────────────────────────────────────────────
interface SectionHeadingProps {
  children: React.ReactNode;
  isArabic: boolean;
}

function SectionHeading({ children, isArabic }: SectionHeadingProps) {
  return (
    <h3
      className={[
        'mb-5 text-[10px] tracking-luxury uppercase text-camel/60',
        isArabic
          ? 'font-arabic tracking-normal text-xs text-right'
          : 'font-body',
      ].join(' ')}
    >
      {children}
    </h3>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const { lang, dir } = useLanguage();
  const isArabic = lang === 'ar';

  const waMessage = encodeURIComponent(
    isArabic
      ? 'مرحبا، أريد الاستفسار عن منتجاتكم'
      : "Bonjour, je voudrais m'informer sur vos produits"
  );
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  // Shared link style for nav items
  const linkBase = [
    'text-xs text-cream-100/60 hover:text-camel',
    'transition-colors duration-300 ease-luxury',
    isArabic ? 'font-arabic' : 'font-body',
  ].join(' ');

  return (
    <footer className="bg-ink text-cream-100" dir={dir}>
      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-luxury mx-auto px-6 sm:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-12">

          {/* ── Section 1: Brand ───────────────────────────────────────────── */}
          <div
            className={[
              'col-span-1 lg:col-span-4 flex flex-col',
              'items-center text-center md:items-start md:text-start',
            ].join(' ')}
          >
            {/* Logo wordmark */}
            <Link
              to="/"
              className="inline-block mb-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-camel/60 rounded-sm"
            >
              <span className="font-display font-light text-3xl text-cream-100 tracking-wider">
                CUIR
              </span>
            </Link>

            {/* Bilingual tagline */}
            <p className="mb-5 font-body text-[10px] tracking-luxury uppercase text-camel/70">
              L'Art du Cuir Marocain
              <span className="mx-2 text-camel/30">·</span>
              <span className="font-arabic tracking-normal text-xs">
                فن الجلد المغربي
              </span>
            </p>

            {/* Description — localized, 2 lines */}
            <p
              className={[
                'text-xs text-cream-100/50 leading-relaxed max-w-[28ch] mb-6',
                isArabic
                  ? 'font-arabic text-sm leading-loose'
                  : 'font-body',
              ].join(' ')}
            >
              {isArabic
                ? 'حقائب جلدية فاخرة مصنوعة يدوياً من قلب المغرب'
                : 'Maroquinerie de luxe façonnée à la main au cœur du Maroc.'}
            </p>

            {/* WhatsApp CTA */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'inline-flex items-center gap-2 mb-6',
                'text-xs text-cream-100/60 hover:text-[#25D366]',
                'transition-colors duration-300 ease-luxury',
                isArabic ? 'font-arabic flex-row-reverse' : 'font-body',
              ].join(' ')}
            >
              <MessageCircle
                className="w-4 h-4 text-[#25D366] flex-shrink-0"
                strokeWidth={1.5}
              />
              <span dir="ltr">+212 600-000000</span>
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/cuir.ma"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={[
                  'w-8 h-8 flex items-center justify-center rounded-full',
                  'border border-cream-100/10 text-cream-100/40',
                  'hover:border-camel/40 hover:text-camel',
                  'transition-all duration-300 ease-luxury',
                ].join(' ')}
              >
                <Instagram className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
              <a
                href="https://facebook.com/cuir.ma"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={[
                  'w-8 h-8 flex items-center justify-center rounded-full',
                  'border border-cream-100/10 text-cream-100/40',
                  'hover:border-camel/40 hover:text-camel',
                  'transition-all duration-300 ease-luxury',
                ].join(' ')}
              >
                <Facebook className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* ── Section 2: Quick links ──────────────────────────────────────── */}
          <div
            className={[
              'col-span-1 lg:col-span-3 lg:col-start-6 flex flex-col',
              'items-center text-center md:items-start md:text-start',
            ].join(' ')}
          >
            <SectionHeading isArabic={isArabic}>
              {isArabic ? 'روابط سريعة' : 'Navigation'}
            </SectionHeading>

            <ul className="space-y-3">
              {QUICK_LINKS.map(({ labelFr, labelAr, path }) => (
                <li key={path}>
                  <Link to={path} className={linkBase}>
                    {isArabic ? labelAr : labelFr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Section 3: Customer service ─────────────────────────────────── */}
          <div
            className={[
              'col-span-1 lg:col-span-3 lg:col-start-10 flex flex-col',
              'items-center text-center md:items-start md:text-start',
            ].join(' ')}
          >
            <SectionHeading isArabic={isArabic}>
              {isArabic ? 'خدمة العملاء' : 'Service Client'}
            </SectionHeading>

            <ul className="space-y-3">
              {SERVICE_LINKS.map(({ labelFr, labelAr, path }) => (
                <li key={path}>
                  <Link to={path} className={linkBase}>
                    {isArabic ? labelAr : labelFr}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="max-w-luxury mx-auto px-6 sm:px-10">
        <div className="border-t border-cream-100/[0.07]" />
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="max-w-luxury mx-auto px-6 sm:px-10 py-5">
        <div
          className={[
            'flex flex-col gap-2 items-center text-center',
            'sm:flex-row sm:justify-between',
          ].join(' ')}
        >
          <span
            className={[
              'text-[11px] text-cream-100/30',
              isArabic ? 'font-arabic' : 'font-body',
            ].join(' ')}
          >
            © 2026 Cuir Maroc.{' '}
            {isArabic ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
          </span>

          <span className="text-[11px] text-cream-100/25 font-body select-none">
            🇲🇦{' '}
            {isArabic ? 'صُنع في المغرب' : 'Fait au Maroc'}
          </span>
        </div>
      </div>
    </footer>
  );
}
