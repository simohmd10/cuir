import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Hammer, Leaf, ShoppingBag, Users, Package, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 text-center"
    >
      <span className="text-4xl font-display font-bold text-gold-300">{number}</span>
      <span className="text-sm text-white/80 mt-1 font-medium">{label}</span>
    </motion.div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white rounded-2xl p-8 shadow-sm border border-beige-100 hover:shadow-md transition-shadow group text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-leather-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-leather-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-leather-800 mb-3">{title}</h3>
      <p className="text-leather-500 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function About() {
  const { t, lang, dir } = useLanguage();

  const values = [
    {
      icon: <Award className="w-8 h-8 text-leather-500" />,
      title: t('quality'),
      description: t('qualityDesc'),
    },
    {
      icon: <Hammer className="w-8 h-8 text-leather-500" />,
      title: t('craftsmanship'),
      description: t('craftsmanshipDesc'),
    },
    {
      icon: <Shield className="w-8 h-8 text-leather-500" />,
      title: t('authenticity'),
      description: t('authenticityDesc'),
    },
  ];

  const stats = [
    {
      number: '+1000',
      label: lang === 'ar' ? 'عميل سعيد' : 'Clients satisfaits',
    },
    {
      number: '+500',
      label: lang === 'ar' ? 'منتج فريد' : 'Produits uniques',
    },
    {
      number: '+5',
      label: lang === 'ar' ? 'سنوات خبرة' : 'Années d\'expérience',
    },
    {
      number: '100%',
      label: lang === 'ar' ? 'جلد طبيعي' : 'Cuir naturel',
    },
  ];

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      {/* ── Hero ── */}
      <motion.div
        className="relative overflow-hidden py-28 px-4 text-center"
        style={{
          background: '#FFFFFF',
        }}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -start-24 w-96 h-96 rounded-full bg-black/5 pointer-events-none" />
        <div className="absolute -bottom-32 -end-20 w-[30rem] h-[30rem] rounded-full bg-black/5 pointer-events-none" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-leather-800/10 pointer-events-none" />

        <motion.div variants={fadeUp} className="relative z-10 max-w-3xl mx-auto">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-10 h-10 text-leather-700" />
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-black mb-4 leading-tight">
            {t('aboutTitle')}
          </h1>
          <p className="text-black/75 text-lg md:text-xl max-w-xl mx-auto">
            {t('aboutSubtitle')}
          </p>
        </motion.div>
      </motion.div>

      {/* ── Story section ── */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-14 md:py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Text */}
          <motion.div variants={fadeUp} className={lang === 'ar' ? 'lg:order-2' : 'lg:order-1'}>
            <h2 className="text-3xl font-display font-bold text-leather-800 mb-5">
              {t('ourStory')}
            </h2>
            <div className="space-y-3.5 text-leather-600 leading-relaxed">
              {lang === 'ar' ? (
                <>
                  <p>
                    وُلدت فكرة متجر <span className="font-bold text-leather-800">Cuir</span> من عشق عميق للحرف
                    اليدوية المغربية الأصيلة. في قلب مراكش، حيث تعبق رائحة الجلد الطبيعي في الأزقة
                    العتيقة، نسجنا قصتنا من خيوط الإبداع والموروث.
                  </p>
                  <p>
                    منذ أكثر من خمس سنوات، نعمل يداً بيد مع أمهر الحرفيين المغاربة لنقدم لكم تحفاً
                    جلدية تجمع بين الأصالة والعصرنة. كل حقيبة، كل محفظة، كل قطعة — هي قصة تُروى بأنامل
                    ماهرة.
                  </p>
                  <p>
                    نلتزم بمعايير أعلى مستوى في الجودة؛ من اختيار الجلد الطبيعي الأفضل، إلى الخياطة
                    الدقيقة التي تضمن عمراً طويلاً لكل منتج. لأن ما تحمله على كتفيك يروي قصتك.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    L'idée de la boutique <span className="font-bold text-leather-800">Cuir</span> est née
                    d'un amour profond pour l'artisanat marocain authentique. Au cœur de Marrakech, où le
                    parfum du cuir naturel emplit les ruelles anciennes, nous avons tissé notre histoire.
                  </p>
                  <p>
                    Depuis plus de cinq ans, nous travaillons main dans la main avec les artisans marocains
                    les plus qualifiés pour vous offrir des pièces en cuir qui allient authenticité et
                    modernité. Chaque sac, chaque portefeuille, chaque pièce — est une histoire racontée
                    par des mains expertes.
                  </p>
                  <p>
                    Nous nous engageons à respecter les plus hauts standards de qualité : de la sélection
                    du meilleur cuir naturel, à la couture précise qui garantit la longévité de chaque
                    produit. Car ce que vous portez raconte votre histoire.
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Artisan image */}
          <motion.div
            variants={fadeUp}
            className={`${lang === 'ar' ? 'lg:order-1' : 'lg:order-2'} relative`}
          >
            <div
              className="rounded-3xl overflow-hidden shadow-xl relative"
              style={{ minHeight: 'clamp(300px, 52vw, 380px)' }}
            >
              <img
                src="/artisan.jpg"
                alt={lang === 'ar' ? 'حرفي مغربي يصنع الجلود' : 'Artisan marocain travaillant le cuir'}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center 25%' }}
                loading="lazy"
                decoding="async"
              />
              {/* Subtle darkening at bottom for card legibility */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)' }}
                aria-hidden="true"
              />

            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Values section ── */}
      <motion.section
        className="bg-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="max-w-6xl mx-auto px-4">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-leather-800 mb-3">{t('ourValues')}</h2>
            <p className="text-leather-500 max-w-xl mx-auto">
              {lang === 'ar'
                ? 'قيمنا هي أساس كل ما نصنعه وكل قرار نتخذه'
                : 'Nos valeurs sont le fondement de tout ce que nous créons et de chaque décision que nous prenons'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <ValueCard key={i} {...v} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Stats section ── */}
      <motion.section
        className="py-20 px-4"
        style={{
          background: 'linear-gradient(160deg, #1C1C1C 0%, #2D2926 60%, #1C1C1C 100%)',
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              {lang === 'ar' ? 'بالأرقام' : 'En chiffres'}
            </h2>
            <p className="text-beige-100/70">
              {lang === 'ar'
                ? 'أرقام تعكس ثقتكم بنا'
                : 'Des chiffres qui reflètent votre confiance en nous'}
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Why choose us ── */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-leather-800 mb-3">
            {lang === 'ar' ? 'لماذا تختارنا؟' : 'Pourquoi nous choisir ?'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: <Leaf className="w-6 h-6 text-emerald-500" />,
              title: lang === 'ar' ? 'جلد طبيعي 100%' : 'Cuir naturel 100%',
              desc: lang === 'ar'
                ? 'نستخدم فقط الجلد الطبيعي عالي الجودة المصنوع بطرق تقليدية في فاس ومراكش'
                : 'Nous utilisons uniquement du cuir naturel de haute qualité fabriqué de manière traditionnelle à Fès et Marrakech',
            },
            {
              icon: <Package className="w-6 h-6 text-leather-500" />,
              title: lang === 'ar' ? 'توصيل سريع' : 'Livraison rapide',
              desc: lang === 'ar'
                ? 'نوصل طلبك في 2-5 أيام عمل إلى جميع مدن المغرب، مجاناً فوق 500 درهم'
                : 'Nous livrons votre commande en 2-5 jours ouvrables dans toutes les villes du Maroc, gratuit au-delà de 500 DH',
            },
            {
              icon: <Users className="w-6 h-6 text-gold-500" />,
              title: lang === 'ar' ? 'خدمة عملاء متميزة' : 'Service client d\'excellence',
              desc: lang === 'ar'
                ? 'فريقنا متاح 6 أيام في الأسبوع للإجابة على كل استفساراتكم'
                : 'Notre équipe est disponible 6 jours par semaine pour répondre à toutes vos questions',
            },
            {
              icon: <Shield className="w-6 h-6 text-blue-500" />,
              title: lang === 'ar' ? 'ضمان الجودة' : 'Garantie qualité',
              desc: lang === 'ar'
                ? 'كل منتج يمر بفحص دقيق قبل الشحن. سياسة إرجاع مريحة خلال 7 أيام'
                : 'Chaque produit passe un contrôle qualité rigoureux avant expédition. Politique de retour facile sous 7 jours',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-beige-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-beige-50 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-leather-800 mb-1">{item.title}</h3>
                <p className="text-leather-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ── */}
      <motion.section
        className="bg-beige-100 py-16 px-4 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <div className="max-w-xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-leather-400 mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold text-leather-800 mb-3">
            {lang === 'ar'
              ? 'اكتشف مجموعتنا الحصرية'
              : 'Découvrez notre collection exclusive'}
          </h2>
          <p className="text-leather-500 mb-7">
            {lang === 'ar'
              ? 'حقائب جلدية فاخرة تنتظرك — اطلب اليوم واستمتع بالتوصيل السريع'
              : 'Des sacs en cuir de luxe vous attendent — commandez aujourd\'hui et profitez de la livraison rapide'}
          </p>
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 bg-ink text-white rounded-full font-bold hover:bg-ink/80 transition-colors shadow-md"
            >
              <ShoppingBag className="w-5 h-5" />
              {lang === 'ar' ? 'تسوق الآن' : 'Acheter Maintenant'}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
