import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Constants ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '212600000000';
const WA_GREEN = '#25D366';

const MESSAGES: Record<'ar' | 'fr', string> = {
  ar: 'مرحبا، أريد الاستفسار عن منتجاتكم',
  fr: 'Bonjour, je voudrais m\'informer sur vos produits',
};

// ─── WhatsAppButton ──────────────────────────────────────────────────────────
export default function WhatsAppButton() {
  const { lang, dir } = useLanguage();
  const [visible, setVisible] = useState(false);

  // Delay appearance by 2 s after mount
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    MESSAGES[lang]
  )}`;

  // RTL: anchor to bottom-left; LTR: bottom-right
  const anchorStyle =
    dir === 'rtl'
      ? { bottom: '1.5rem', left: '1.5rem' }
      : { bottom: '1.5rem', right: '1.5rem' };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed z-50"
          style={anchorStyle}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 22,
          }}
        >
          {/* ── Pulse ring ──────────────────────────────────────────────── */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ backgroundColor: WA_GREEN }}
            animate={{
              scale: [1, 1.55, 1.55],
              opacity: [0.55, 0, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeOut',
              repeatDelay: 0.5,
            }}
          />

          {/* ── Button ──────────────────────────────────────────────────── */}
          <motion.a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              lang === 'ar'
                ? 'تواصل عبر واتساب'
                : 'Contacter via WhatsApp'
            }
            className="relative flex items-center justify-center w-14 h-14 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
            style={{
              backgroundColor: WA_GREEN,
              boxShadow: '0 4px 24px rgba(37, 211, 102, 0.40)',
            }}
            whileHover={{
              scale: 1.08,
              boxShadow: '0 6px 32px rgba(37, 211, 102, 0.58)',
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Notification badge */}
            <span
              aria-label="1 new message"
              className={[
                'absolute -top-0.5 w-[18px] h-[18px] rounded-full',
                'bg-red-500 text-white text-[10px] font-bold leading-none',
                'flex items-center justify-center shadow-sm z-10',
                dir === 'rtl' ? '-left-0.5' : '-right-0.5',
              ].join(' ')}
            >
              1
            </span>

            <MessageCircle
              className="w-6 h-6 text-white relative z-10"
              strokeWidth={1.75}
            />
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
