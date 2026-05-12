import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WHATSAPP_NUMBER = '212691553120';
const WA_GREEN = '#25D366';

const MESSAGES: Record<'ar' | 'fr', string> = {
  ar: 'مرحبا، أريد الاستفسار عن منتجاتكم',
  fr: "Bonjour, je voudrais m'informer sur vos produits",
};

export default function WhatsAppButton() {
  const { lang, dir } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGES[lang])}`;

  // Positioned high enough on mobile to never overlap sticky product/checkout CTAs
  const positionCls = dir === 'rtl'
    ? 'bottom-20 left-4 md:bottom-8 md:left-8'
    : 'bottom-20 right-4 md:bottom-8 md:right-8';

  return (
    <div
      className={[
        'fixed z-40',
        positionCls,
        'transition-all duration-500 ease-[var(--ease-luxury)]',
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none',
      ].join(' ')}
    >
      {/* Pulse ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full wa-pulse"
        style={{ backgroundColor: WA_GREEN }}
      />

      {/* Button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={lang === 'ar' ? 'تواصل عبر واتساب' : 'Contacter via WhatsApp'}
        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] hover:scale-110 active:scale-95 transition-transform duration-300"
        style={{
          backgroundColor: WA_GREEN,
          boxShadow: '0 4px 24px rgba(37, 211, 102, 0.40)',
        }}
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white relative z-10" strokeWidth={1.75} />
      </a>
    </div>
  );
}
