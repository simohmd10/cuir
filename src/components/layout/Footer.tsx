import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const quickLinks = [
  { key: 'home' as const, path: '/' },
  { key: 'shop' as const, path: '/shop' },
  { key: 'about' as const, path: '/about' },
  { key: 'contact' as const, path: '/contact' },
  { key: 'faq' as const, path: '/faq' },
] as const;

const customerServiceLinks = [
  { key: 'trackOrder' as const, path: '/track-order' },
  { key: 'returnPolicy' as const, path: '/return-policy' },
  { key: 'privacyPolicy' as const, path: '/privacy-policy' },
] as const;

const WHATSAPP_NUMBER = '212600000000';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'مرحباً، أريد الاستفسار عن منتجاتكم | Bonjour, je voudrais des renseignements sur vos produits'
);

export default function Footer() {
  const { lang, t, dir } = useLanguage();

  return (
    <footer
      className="bg-stone-900 text-stone-300"
      dir={dir}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-baseline gap-2 mb-4">
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                Cuir
              </span>
              <span className="font-arabic text-sm text-stone-400">كوير</span>
            </Link>
            <p
              className={[
                'text-sm text-stone-400 leading-relaxed mb-5',
                lang === 'ar' ? 'font-arabic' : '',
              ].join(' ')}
            >
              {t('footerDesc')}
            </p>

            {/* Contact details */}
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-stone-400">
                <Phone className="w-4 h-4 flex-shrink-0 text-gold-500" />
                <span dir="ltr">+212 600-000000</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <Mail className="w-4 h-4 flex-shrink-0 text-gold-500" />
                <span>contact@cuir.ma</span>
              </li>
              <li className="flex items-center gap-2 text-stone-400">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gold-500" />
                <span className={lang === 'ar' ? 'font-arabic' : ''}>
                  {lang === 'ar' ? 'مراكش، المغرب' : 'Marrakech, Maroc'}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2 — Quick links */}
          <div>
            <h3
              className={[
                'text-white font-semibold text-sm uppercase tracking-wider mb-4',
                lang === 'ar' ? 'font-arabic' : 'font-display',
              ].join(' ')}
            >
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map(({ key, path }) => (
                <li key={key}>
                  <Link
                    to={path}
                    className={[
                      'text-sm text-stone-400 hover:text-gold-400 transition-colors duration-150',
                      lang === 'ar' ? 'font-arabic' : '',
                    ].join(' ')}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Customer service */}
          <div>
            <h3
              className={[
                'text-white font-semibold text-sm uppercase tracking-wider mb-4',
                lang === 'ar' ? 'font-arabic' : 'font-display',
              ].join(' ')}
            >
              {t('customerService')}
            </h3>
            <ul className="space-y-2">
              {customerServiceLinks.map(({ key, path }) => (
                <li key={key}>
                  <Link
                    to={path}
                    className={[
                      'text-sm text-stone-400 hover:text-gold-400 transition-colors duration-150',
                      lang === 'ar' ? 'font-arabic' : '',
                    ].join(' ')}
                  >
                    {t(key)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'text-sm text-stone-400 hover:text-gold-400 transition-colors duration-150 inline-flex items-center gap-1.5',
                    lang === 'ar' ? 'font-arabic' : '',
                  ].join(' ')}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  {t('whatsapp')}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Social */}
          <div>
            <h3
              className={[
                'text-white font-semibold text-sm uppercase tracking-wider mb-4',
                lang === 'ar' ? 'font-arabic' : 'font-display',
              ].join(' ')}
            >
              {t('followUs')}
            </h3>

            <div className="flex gap-3 mb-6">
              {/* Instagram */}
              <a
                href="https://instagram.com/cuir.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/cuir.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-blue-600 flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-stone-800 hover:bg-[#25D366] flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>

            {/* Working hours */}
            <p className={`text-xs text-stone-500 ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {t('workingHours')}
            </p>
            <p className={`text-xs text-stone-400 mt-0.5 ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {t('workingHoursValue')}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <span className={lang === 'ar' ? 'font-arabic' : ''}>
            &copy; {new Date().getFullYear()} Cuir. {t('allRightsReserved')}
          </span>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy-policy"
              className={`hover:text-gold-400 transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}
            >
              {t('privacyPolicy')}
            </Link>
            <Link
              to="/return-policy"
              className={`hover:text-gold-400 transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}
            >
              {t('returnPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
