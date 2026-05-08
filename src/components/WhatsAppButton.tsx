import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const WHATSAPP_NUMBER = '212600000000';

export default function WhatsAppButton() {
  const { lang, dir, t } = useLanguage();

  const message = encodeURIComponent(
    lang === 'ar'
      ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
      : 'Bonjour, je voudrais des renseignements sur vos produits'
  );

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  // Position: bottom-right for LTR, bottom-left for RTL
  const positionClass = dir === 'rtl' ? 'bottom-6 left-6' : 'bottom-6 right-6';

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp')}
      className={`fixed ${positionClass} z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-green-900/30`}
      style={{ backgroundColor: '#25D366' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulse ring */}
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: '#25D366' }}
        animate={{ scale: [1, 1.4, 1.4], opacity: [0.7, 0, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Notification badge */}
      <span className="absolute -top-1 -end-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm z-10 leading-none">
        1
      </span>

      <MessageCircle className="w-7 h-7 text-white relative z-10" />
    </motion.a>
  );
}
