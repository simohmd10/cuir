import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
}

/* ─────────────────────────────────────────
   Shared ease
───────────────────────────────────────── */
const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/* ─────────────────────────────────────────
   Motion variants
───────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.05,
      delay,
      ease: EASE,
    },
  }),
};

const scrollIndicator = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1.5,
      duration: 0.6,
      ease: EASE,
    },
  },
};

const scrollChevron = {
  animate: {
    y: [0, 7, 0],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.9,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut',
    },
  },
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function HeroVideo({ videoSrc, posterSrc }: HeroVideoProps) {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);

  /* ── Copy (all bilingual) ── */
  const label        = isAr ? 'كوير | المغرب'                   : 'CUIR | MAROC';
  const heading      = isAr ? 'حقائب جلدية فاخرة'               : "L'Art du Cuir Marocain";
  const subtitle     = isAr
    ? 'صناعة يدوية أصيلة من قلب مراكش'
    : 'Savoir-faire artisanal du cœur de Marrakech';
  const primaryCta   = isAr ? 'تسوق الآن'    : 'Découvrir';
  const secondaryCta = isAr ? 'اكتشف قصتنا' : 'Notre Histoire';
  const scrollLabel  = isAr ? 'مرر للأسفل'  : 'Défiler';

  /* ── Directional arrow for secondary CTA ── */
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const arrowMoveClass = isAr
    ? 'group-hover:-translate-x-1'
    : 'group-hover:translate-x-1';

  return (
    <section
      dir={dir}
      className="relative w-full h-[100svh] md:h-[95vh] overflow-hidden flex items-center justify-center hero-grain"
      aria-label={isAr ? 'القسم الرئيسي' : 'Section héro'}
    >

      {/* ══ Background layer: video or cinematic CSS gradient ══ */}
      {videoSrc ? (
        <video
          ref={videoRef}
          className="hero-video"
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #1C1C1C 0%, #2D2926 40%, #3D3028 70%, #C4A882 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* ══ Warm dark overlay — bottom-to-top so text is always legible ══ */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(28,28,28,0.78) 0%, rgba(28,28,28,0.42) 38%, rgba(28,28,28,0.10) 72%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ══ Hero content (above overlay, above grain) ══ */}
      <div className="relative z-10 w-full container-luxury flex flex-col items-center text-center px-6">

        {/* ── Small label ── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className={[
            'mb-5 md:mb-7 tracking-[0.28em] uppercase font-body font-light',
            'text-[13px] md:text-[14px] text-camel',
          ].join(' ')}
        >
          {label}
        </motion.p>

        {/* ── Main heading ── */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className={[
            'font-light leading-[1.05] text-balance',
            isAr
              ? 'font-arabic text-[clamp(2.8rem,8vw,6.5rem)]'
              : 'font-display text-[clamp(3rem,8.5vw,7rem)]',
          ].join(' ')}
          style={{ color: '#FDFCFB' }}
        >
          {heading}
        </motion.h1>

        {/* ── Subtitle ── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.8}
          className={[
            'mt-6 md:mt-8 max-w-md mx-auto font-body font-light',
            'tracking-wide leading-relaxed',
            'text-cream-300/80',
            isAr
              ? 'font-arabic text-base md:text-lg'
              : 'text-sm md:text-[15px]',
          ].join(' ')}
        >
          {subtitle}
        </motion.p>

        {/* ── Call-to-action row ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1.1}
          className="mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {/* Primary — white text, thin underline, luxury ghost */}
          <Link
            to="/shop"
            className="group relative inline-flex items-center gap-2 pb-0.5"
          >
            <span
              className={[
                'relative font-body font-light tracking-[0.20em] uppercase',
                'text-cream-100 text-xs md:text-[13px]',
                'transition-colors duration-500 ease-[var(--ease-luxury)]',
                'group-hover:text-camel',
              ].join(' ')}
            >
              {primaryCta}
              {/* thin underline — camel on hover */}
              <span
                className="absolute -bottom-px left-0 right-0 h-px bg-cream-100 group-hover:bg-camel transition-colors duration-500 ease-[var(--ease-luxury)]"
              />
            </span>
          </Link>

          {/* Vertical divider */}
          <span
            className="hidden sm:block w-px h-4 bg-cream-100/25"
            aria-hidden="true"
          />

          {/* Secondary — camel, directional arrow */}
          <Link
            to="/about"
            className={[
              'group inline-flex items-center gap-2',
              'text-camel font-body font-light tracking-[0.14em] uppercase text-xs md:text-[13px]',
              'transition-colors duration-500 ease-[var(--ease-luxury)] hover:text-camel-200',
            ].join(' ')}
          >
            {/* Arrow before label in RTL */}
            {isAr && (
              <ArrowIcon
                className={[
                  'w-3.5 h-3.5 shrink-0',
                  'transition-transform duration-400 ease-[var(--ease-luxury)]',
                  arrowMoveClass,
                ].join(' ')}
                strokeWidth={1.5}
              />
            )}
            <span>{secondaryCta}</span>
            {/* Arrow after label in LTR */}
            {!isAr && (
              <ArrowIcon
                className={[
                  'w-3.5 h-3.5 shrink-0',
                  'transition-transform duration-400 ease-[var(--ease-luxury)]',
                  arrowMoveClass,
                ].join(' ')}
                strokeWidth={1.5}
              />
            )}
          </Link>
        </motion.div>
      </div>

      {/* ══ Scroll indicator ══ */}
      <motion.div
        variants={scrollIndicator}
        initial="hidden"
        animate="visible"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span
          className={[
            'font-body font-light tracking-[0.22em] uppercase text-[10px]',
            'text-cream-100/45',
          ].join(' ')}
        >
          {scrollLabel}
        </span>
        <motion.div
          variants={scrollChevron}
          animate="animate"
        >
          <ChevronDown
            className="w-4 h-4 text-cream-100/55"
            strokeWidth={1.5}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
