import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Slide {
  id: number;
  gradient: string;
  titleFr: string;
  titleAr: string;
  subtitleFr: string;
  subtitleAr: string;
  ctaFr: string;
  ctaAr: string;
  ctaLink: string;
}

const slides: Slide[] = [
  {
    id: 1,
    gradient: 'from-stone-900 via-leather-800 to-stone-800',
    titleFr: 'Artisanat Marocain',
    titleAr: 'الحرفية المغربية الأصيلة',
    subtitleFr: 'Sacs en cuir véritable, faits à la main avec passion',
    subtitleAr: 'حقائب جلدية حقيقية، مصنوعة يدوياً بعشق واتقان',
    ctaFr: 'Découvrir la Collection',
    ctaAr: 'اكتشف المجموعة',
    ctaLink: '/shop',
  },
  {
    id: 2,
    gradient: 'from-amber-950 via-amber-900 to-stone-900',
    titleFr: 'Luxe & Élégance',
    titleAr: 'الفخامة والأناقة',
    subtitleFr: 'Chaque pièce raconte une histoire de savoir-faire ancestral',
    subtitleAr: 'كل قطعة تحكي قصة من المهارة الموروثة عبر الأجيال',
    ctaFr: 'Voir les Nouveautés',
    ctaAr: 'شاهد الجديد',
    ctaLink: '/shop?filter=new',
  },
  {
    id: 3,
    gradient: 'from-stone-950 via-stone-800 to-amber-900',
    titleFr: 'Collection Exclusive',
    titleAr: 'المجموعة الحصرية',
    subtitleFr: 'Éditions limitées pour les connaisseurs du beau',
    subtitleAr: 'إصدارات محدودة لعشاق الجمال والذوق الرفيع',
    ctaFr: 'Éditions Limitées',
    ctaAr: 'الإصدارات المحدودة',
    ctaLink: '/shop?filter=featured',
  },
];

const BannerCarousel: React.FC = () => {
  const { lang, dir } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: dir });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  // Auto-play every 5 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [emblaApi]);

  return (
    <div className="relative w-full overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => {
            const title = lang === 'ar' ? slide.titleAr : slide.titleFr;
            const subtitle = lang === 'ar' ? slide.subtitleAr : slide.subtitleFr;
            const cta = lang === 'ar' ? slide.ctaAr : slide.ctaFr;

            return (
              <div
                key={slide.id}
                className={`relative flex-none w-full min-h-[80vh] md:min-h-[90vh] bg-gradient-to-br ${slide.gradient} flex items-center`}
              >
                {/* Decorative pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.8'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-black/50 to-transparent`} />

                {/* Content */}
                <div
                  className={`relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                >
                  {selectedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                      {/* Decorative line */}
                      <motion.div
                        className="w-16 h-0.5 bg-gold-500 mb-6"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        style={{ transformOrigin: dir === 'rtl' ? 'right' : 'left', marginInlineStart: 0 }}
                      />

                      <motion.h1
                        className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      >
                        {title}
                      </motion.h1>

                      <motion.p
                        className={`text-lg md:text-xl text-white/80 mb-8 max-w-xl ${lang === 'ar' ? 'font-arabic' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        {subtitle}
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                      >
                        <Link
                          to={slide.ctaLink}
                          className={`inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-400 text-stone-900 font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold-500/30 ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
                        >
                          {cta}
                          <span className={dir === 'rtl' ? 'rotate-180' : ''}>→</span>
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                  {selectedIndex !== index && (
                    <div>
                      <div className="w-16 h-0.5 bg-gold-500 mb-6" />
                      <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}>
                        {title}
                      </h1>
                      <p className={`text-lg md:text-xl text-white/80 mb-8 max-w-xl ${lang === 'ar' ? 'font-arabic' : ''}`}>
                        {subtitle}
                      </p>
                      <Link
                        to={slide.ctaLink}
                        className={`inline-flex items-center gap-2 px-8 py-4 bg-gold-500 text-stone-900 font-bold rounded-full ${lang === 'ar' ? 'font-arabic' : 'font-display'}`}
                      >
                        {cta}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation arrows - desktop only */}
      <button
        onClick={scrollPrev}
        className="hidden md:flex absolute start-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 items-center justify-center text-white transition-all duration-200 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="hidden md:flex absolute end-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 items-center justify-center text-white transition-all duration-200 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={[
              'transition-all duration-300 rounded-full',
              selectedIndex === index
                ? 'w-8 h-2 bg-gold-500'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80',
            ].join(' ')}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
