import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ── FAQ data ──────────────────────────────────────────────────────────────────

interface FaqItem {
  category: { ar: string; fr: string };
  question: { ar: string; fr: string };
  answer: { ar: string; fr: string };
}

const FAQ_ITEMS: FaqItem[] = [
  // ── Shipping ──
  {
    category: { ar: 'التوصيل', fr: 'Livraison' },
    question: {
      ar: 'كم يستغرق وقت التوصيل؟',
      fr: 'Quel est le délai de livraison ?',
    },
    answer: {
      ar: 'يستغرق التوصيل عادةً من 2 إلى 5 أيام عمل داخل المغرب. الطلبات المقدمة قبل الساعة 12 ظهراً تُعالج في نفس اليوم.',
      fr: 'La livraison prend généralement 2 à 5 jours ouvrables au Maroc. Les commandes passées avant 12h sont traitées le jour même.',
    },
  },
  {
    category: { ar: 'التوصيل', fr: 'Livraison' },
    question: {
      ar: 'كم تبلغ تكلفة التوصيل؟',
      fr: 'Quel est le coût de livraison ?',
    },
    answer: {
      ar: 'رسوم التوصيل 30 درهماً لجميع الطلبات. أما الطلبات التي تتجاوز قيمتها 500 درهم فتستفيد من التوصيل المجاني.',
      fr: 'Les frais de livraison sont de 30 DH pour toutes les commandes. Les commandes dépassant 500 DH bénéficient de la livraison gratuite.',
    },
  },
  {
    category: { ar: 'التوصيل', fr: 'Livraison' },
    question: {
      ar: 'هل تتوفر خدمة التوصيل في كل مدن المغرب؟',
      fr: 'La livraison est-elle disponible dans toutes les villes du Maroc ?',
    },
    answer: {
      ar: 'نعم، نوصل إلى جميع مدن ومناطق المغرب بما فيها الدار البيضاء، الرباط، مراكش، فاس، أكادير، طنجة وغيرها.',
      fr: 'Oui, nous livrons dans toutes les villes et régions du Maroc, y compris Casablanca, Rabat, Marrakech, Fès, Agadir, Tanger et bien d\'autres.',
    },
  },

  // ── Returns ──
  {
    category: { ar: 'الإرجاع والاستبدال', fr: 'Retours & Échanges' },
    question: {
      ar: 'ما هي سياسة الإرجاع؟',
      fr: 'Quelle est votre politique de retour ?',
    },
    answer: {
      ar: 'نقبل إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام، شريطة أن يكون المنتج بحالته الأصلية وغير مستعمل. تواصل معنا عبر واتساب أو البريد الإلكتروني لبدء عملية الإرجاع.',
      fr: 'Nous acceptons les retours dans les 7 jours suivant la réception, à condition que le produit soit dans son état d\'origine et non utilisé. Contactez-nous via WhatsApp ou email pour initier le processus de retour.',
    },
  },
  {
    category: { ar: 'الإرجاع والاستبدال', fr: 'Retours & Échanges' },
    question: {
      ar: 'هل يمكنني استبدال المنتج بمقاس أو لون مختلف؟',
      fr: 'Puis-je échanger le produit contre une autre taille ou couleur ?',
    },
    answer: {
      ar: 'بالطبع! نقبل الاستبدال خلال 7 أيام. إذا كان المنتج البديل ذا قيمة مختلفة، يُحسب الفرق أو يُسترد حسب الحالة.',
      fr: 'Bien sûr ! Nous acceptons les échanges dans les 7 jours. Si le produit de remplacement a une valeur différente, la différence sera facturée ou remboursée selon le cas.',
    },
  },

  // ── Payment ──
  {
    category: { ar: 'الدفع', fr: 'Paiement' },
    question: {
      ar: 'ما هي طرق الدفع المتاحة؟',
      fr: 'Quels modes de paiement acceptez-vous ?',
    },
    answer: {
      ar: 'حالياً، نقبل الدفع عند الاستلام (نقداً) فقط. ادفع ثمن طلبك فقط عندما يصل إلى باب منزلك.',
      fr: 'Actuellement, nous acceptons uniquement le paiement à la livraison (en espèces). Vous ne payez que lorsque votre commande arrive chez vous.',
    },
  },

  // ── Orders ──
  {
    category: { ar: 'الطلبات', fr: 'Commandes' },
    question: {
      ar: 'كيف يمكنني تتبع طلبي؟',
      fr: 'Comment suivre ma commande ?',
    },
    answer: {
      ar: 'بعد تأكيد الطلب ستحصل على مرجع الطلب. يمكنك متابعة الحالة عبر صفحة تتبع الطلب أو التواصل مع خدمة العملاء.',
      fr: 'Après confirmation, vous recevez une référence de commande. Vous pouvez suivre le statut via la page de suivi ou contacter notre service client.',
    },
  },
  {
    category: { ar: 'الطلبات', fr: 'Commandes' },
    question: {
      ar: 'هل يمكن تعديل الطلب بعد تأكيده؟',
      fr: 'Puis-je modifier ma commande après confirmation ?',
    },
    answer: {
      ar: 'يمكن تعديل الطلب قبل الشحن فقط. تواصل معنا سريعاً مع رقم الطلب لتأكيد إمكانية التعديل.',
      fr: 'La modification est possible uniquement avant l’expédition. Contactez-nous rapidement avec votre référence de commande.',
    },
  },

  // ── Product care ──
  {
    category: { ar: 'العناية بالمنتجات', fr: 'Entretien des produits' },
    question: {
      ar: 'كيف أعتني بحقيبتي الجلدية؟',
      fr: 'Comment entretenir mon sac en cuir ?',
    },
    answer: {
      ar: `للحفاظ على جمال حقيبتك لسنوات طويلة:\n• نظف الغبار بقطعة قماش ناعمة وجافة\n• استخدم كريم الجلد الطبيعي مرة كل 3 أشهر\n• تجنب التعرض المباشر للشمس والمطر\n• احفظها في كيس القماش المرفق عند عدم الاستخدام\n• لا تستخدم منظفات كيميائية قاسية`,
      fr: `Pour préserver la beauté de votre sac pendant des années :\n• Nettoyez la poussière avec un chiffon doux et sec\n• Utilisez une crème pour cuir naturel tous les 3 mois\n• Évitez l'exposition directe au soleil et à la pluie\n• Rangez-le dans le sac en tissu fourni lorsqu'il n'est pas utilisé\n• N'utilisez pas de détergents chimiques agressifs`,
    },
  },
  {
    category: { ar: 'العناية بالمنتجات', fr: 'Entretien des produits' },
    question: {
      ar: 'هل تتغير رائحة الجلد الطبيعي مع الوقت؟',
      fr: 'L\'odeur du cuir naturel change-t-elle avec le temps ?',
    },
    answer: {
      ar: 'نعم، رائحة الجلد الطبيعي جزء من جماله وأصالته. مع الاستخدام والوقت، تتحول الرائحة لتصبح أكثر نعومة. يمكنك استخدام القليل من شمع الجلد للحفاظ على الرائحة الطبيعية.',
      fr: 'Oui, l\'odeur du cuir naturel fait partie de son charme et de son authenticité. Avec le temps et l\'utilisation, l\'odeur devient plus douce. Vous pouvez utiliser un peu de cire pour cuir pour préserver l\'odeur naturelle.',
    },
  },

];

// ── Accordion item ────────────────────────────────────────────────────────────

function AccordionItem({
  item,
  lang,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  lang: 'ar' | 'fr';
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card-luxury overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-beige-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-leather-800 text-sm leading-snug">
          {item.question[lang]}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-leather-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="border-t border-beige-100 pt-4">
                <p className="text-leather-600 text-sm leading-relaxed whitespace-pre-line">
                  {item.answer[lang]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FAQ() {
  const { t, lang, dir } = useLanguage();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return FAQ_ITEMS;
    const q = search.toLowerCase();
    return FAQ_ITEMS.filter(
      (item) =>
        item.question[lang].toLowerCase().includes(q) ||
        item.answer[lang].toLowerCase().includes(q) ||
        item.category[lang].toLowerCase().includes(q)
    );
  }, [search, lang]);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, FaqItem[]> = {};
    filtered.forEach((item) => {
      const cat = item.category[lang];
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [filtered, lang]);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Global index for accordion
  let globalIdx = 0;

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      {/* ── Header ── */}
      <div
        className="relative py-20 px-4 text-center"
        style={{
          background: 'linear-gradient(160deg, #FFFFFF 0%, #F7F7F7 100%)',
        }}
      >
        <div className="absolute -top-16 -start-16 w-64 h-64 rounded-full bg-black/5 pointer-events-none" />
        <div className="absolute -bottom-20 -end-10 w-80 h-80 rounded-full bg-black/5 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-gold-300" />
          </div>
          <h1 className="text-4xl font-display font-bold text-black mb-3">{t('faqTitle')}</h1>
          <p className="text-black/70 text-base max-w-md mx-auto">{t('faqSubtitle')}</p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* ── Search ── */}
        <motion.div
          className="relative mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-leather-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpenIndex(null);
            }}
            placeholder={
              lang === 'ar'
                ? 'ابحث في الأسئلة الشائعة...'
                : 'Rechercher dans la FAQ...'
            }
            className="input-soft ps-12 pe-4 py-4 rounded-2xl shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-leather-400 hover:text-leather-600 text-xs font-medium"
            >
              {lang === 'ar' ? 'مسح' : 'Effacer'}
            </button>
          )}
        </motion.div>

        {/* ── No results ── */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <HelpCircle className="w-12 h-12 text-leather-300 mx-auto mb-3" />
            <p className="text-leather-500 font-medium">
              {lang === 'ar'
                ? 'لا توجد نتائج مطابقة لبحثك'
                : 'Aucun résultat correspondant à votre recherche'}
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-leather-500 underline text-sm hover:text-leather-700"
            >
              {lang === 'ar' ? 'إعادة ضبط البحث' : 'Réinitialiser la recherche'}
            </button>
          </motion.div>
        )}

        {/* ── FAQ Groups ── */}
        {Object.entries(grouped).map(([category, items]) => (
          <motion.section
            key={category}
            className="mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-sm font-bold text-leather-400 uppercase tracking-widest mb-4 px-1">
              {category}
            </h2>
            <div className="space-y-3">
              {items.map((item) => {
                const idx = globalIdx++;
                return (
                  <AccordionItem
                    key={`${item.question.ar}-${idx}`}
                    item={item}
                    lang={lang}
                    isOpen={openIndex === idx}
                    onToggle={() => handleToggle(idx)}
                  />
                );
              })}
            </div>
          </motion.section>
        ))}

        {/* ── Still have questions ── */}
        <motion.div
          className="mt-10 bg-ink rounded-2xl p-8 text-center text-white"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <MessageCircle className="w-10 h-10 text-gold-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">
            {lang === 'ar'
              ? 'لم تجد إجابتك؟'
              : 'Vous n\'avez pas trouvé votre réponse ?'}
          </h3>
          <p className="text-white/80 text-sm mb-5">
            {lang === 'ar'
              ? 'فريقنا جاهز للإجابة على كل استفساراتكم عبر واتساب أو البريد الإلكتروني'
              : 'Notre équipe est prête à répondre à toutes vos questions via WhatsApp ou email'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/212691553120"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#25D366] text-white rounded-full font-semibold hover:bg-[#1ebe5d] transition-colors text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              {t('whatsapp')}
            </a>
            <a
              href="mailto:contact@cuir.ma"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 text-white border border-white/30 rounded-full font-semibold hover:bg-white/20 transition-colors text-sm"
            >
              {lang === 'ar' ? 'راسلنا بالبريد' : 'Envoyer un email'}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
