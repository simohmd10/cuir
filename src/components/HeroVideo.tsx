import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroVideoProps {
  videoSrc?: string;
  mp4Src?: string;
  posterSrc?: string;
}

export default function HeroVideo({ videoSrc, mp4Src, posterSrc }: HeroVideoProps) {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  /* ── Copy (bilingual) ── */
  const label        = isAr ? 'كوير | المغرب'                   : 'CUIR | MAROC';
  const heading      = isAr ? 'حقائب جلدية فاخرة'               : "L'Art du Cuir Marocain";
  const subtitle     = isAr
    ? 'صناعة يدوية أصيلة من قلب مراكش'
    : 'Savoir-faire artisanal du cœur de Marrakech';
  const primaryCta   = isAr ? 'تسوق الآن'    : 'Découvrir';
  const secondaryCta = isAr ? 'اكتشف قصتنا' : 'Notre Histoire';
  const scrollLabel  = isAr ? 'مرر للأسفل'  : 'Défiler';

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const arrowMoveClass = isAr
    ? 'group-hover:-translate-x-1'
    : 'group-hover:translate-x-1';

  /* ── Load video on all devices; skip only on very slow connections ── */
  useEffect(() => {
    if (!videoSrc) return;

    // Only skip on save-data or truly unusable connections (slow-2g / 2g)
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && ['slow-2g', '2g'].includes(conn.effectiveType)) return;

    // Small delay so the first paint + poster render before video starts loading
    const id = setTimeout(() => setVideoReady(true), 300);
    return () => clearTimeout(id);
  }, [videoSrc]);

  /* ── Play video once it's revealed in DOM ── */
  useEffect(() => {
    if (videoReady && videoRef.current) {
      videoRef.current.play().catch(() => {/* autoplay blocked silently */});
    }
  }, [videoReady]);

  return (
    <section
      dir={dir}
      className="relative w-full h-[100svh] md:h-[95vh] overflow-hidden flex items-center justify-center hero-grain"
      aria-label={isAr ? 'القسم الرئيسي' : 'Section héro'}
    >

      {/* ══ Background: Ken Burns image (always) ══ */}
      {posterSrc && (
        <div
          className="absolute inset-0 bg-cover bg-center hero-ken-burns"
          style={{ backgroundImage: `url(${posterSrc})` }}
          aria-hidden="true"
        />
      )}

      {/* ══ Video layer (desktop only, lazy, skipped on slow/low-end) ══ */}
      {videoSrc && videoReady && (
        <video
          ref={videoRef}
          className="hero-video hero-video-fade"
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={videoSrc} type="video/webm" />
          {mp4Src && <source src={mp4Src} type="video/mp4" />}
        </video>
      )}

      {/* ══ Fallback gradient when no image/video ══ */}
      {!posterSrc && !videoSrc && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 55%, #F1ECE5 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* ══ Soft readability overlay (no bottom fog) ══ */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.10) 38%, rgba(255,255,255,0.06) 68%, rgba(255,255,255,0.03) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ══ Hero content ══ */}
      <div className="relative z-10 w-full container-luxury flex flex-col items-center text-center px-6">

        {/* Label */}
        <p className={[
          'hero-label mb-5 md:mb-7 tracking-[0.28em] uppercase font-body font-light',
          'text-[13px] md:text-[14px] text-camel',
        ].join(' ')}>
          {label}
        </p>

        {/* Heading */}
        <h1 className={[
          'hero-heading font-light leading-[1.05] text-balance',
          isAr
            ? 'font-arabic text-[clamp(2.8rem,8vw,6.5rem)]'
            : 'font-display text-[clamp(3rem,8.5vw,7rem)]',
        ].join(' ')}
          style={{ color: '#1C1C1C' }}
        >
          {heading}
        </h1>

        {/* Subtitle */}
        <p className={[
          'hero-subtitle mt-6 md:mt-8 max-w-md mx-auto font-body font-light',
          'tracking-wide leading-relaxed text-ink/70',
          isAr
            ? 'font-arabic text-base md:text-lg'
            : 'text-sm md:text-[15px]',
        ].join(' ')}>
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="hero-ctas mt-10 md:mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10">

          {/* Primary */}
          <Link to="/shop" className="group relative inline-flex items-center gap-2 pb-0.5">
            <span className={[
              'relative font-body font-light tracking-[0.20em] uppercase',
              'text-ink text-xs md:text-[13px]',
              'transition-colors duration-500 ease-[var(--ease-luxury)]',
              'group-hover:text-camel',
            ].join(' ')}>
              {primaryCta}
              <span className="absolute -bottom-px left-0 right-0 h-px bg-ink/80 group-hover:bg-camel transition-colors duration-500 ease-[var(--ease-luxury)]" />
            </span>
          </Link>

          {/* Divider */}
          <span className="hidden sm:block w-px h-4 bg-cream-100/25" aria-hidden="true" />

          {/* Secondary */}
          <Link
            to="/about"
            className={[
              'group inline-flex items-center gap-2',
              'text-camel font-body font-light tracking-[0.14em] uppercase text-xs md:text-[13px]',
              'transition-colors duration-500 ease-[var(--ease-luxury)] hover:text-camel-200',
            ].join(' ')}
          >
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
        </div>
      </div>

      {/* ══ Scroll indicator ══ */}
      <div
        className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className={[
          'font-body font-light tracking-[0.22em] uppercase text-[10px]',
          'text-ink/45',
        ].join(' ')}>
          {scrollLabel}
        </span>
        <ChevronDown
          className="w-4 h-4 text-ink/55 hero-bounce"
          strokeWidth={1.5}
        />
      </div>
    </section>
  );
}
