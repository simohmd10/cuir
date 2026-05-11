import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SECTION_CLASS = 'bg-white border border-beige-200 rounded-2xl p-6 md:p-7 shadow-sm';

export default function ReturnsPolicy() {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';

  const sections = [
    {
      title: isAr ? 'شروط الإرجاع' : 'Conditions de retour',
      items: isAr
        ? [
            'يمكن طلب الإرجاع خلال 7 أيام من تاريخ الاستلام.',
            'يجب أن يبقى المنتج في حالته الأصلية، غير مستعمل، مع التغليف والإكسسوارات المرفقة.',
            'المنتجات المعدلة حسب الطلب أو المتضررة بسبب الاستخدام غير مؤهلة للإرجاع.',
          ]
        : [
            'Le retour peut être demandé dans un délai de 7 jours après réception.',
            'Le produit doit rester dans son état d’origine, non utilisé, avec emballage et accessoires.',
            'Les articles personnalisés ou endommagés après usage ne sont pas éligibles au retour.',
          ],
    },
    {
      title: isAr ? 'الشحن والإرجاع' : 'Expédition du retour',
      items: isAr
        ? [
            'يتم بدء طلب الإرجاع عبر التواصل معنا من صفحة الاتصال أو واتساب.',
            'تكلفة الإرجاع يتحملها العميل إلا في حالة خطأ في الطلب أو عيب مصنعي مثبت.',
            'بعد استلام موافقة الإرجاع، يتم إرسال تعليمات الشحن وعنوان الإرجاع.',
          ]
        : [
            'La demande de retour commence via notre page contact ou WhatsApp.',
            'Les frais de retour sont à la charge du client sauf erreur de commande ou défaut confirmé.',
            'Après validation, nous envoyons les instructions d’expédition et l’adresse de retour.',
          ],
    },
    {
      title: isAr ? 'الاستبدال والتعويض' : 'Échange et remboursement',
      items: isAr
        ? [
            'يمكن الاستبدال حسب توفر المخزون لنفس المنتج بلون/مقاس مختلف.',
            'يتم رد المبلغ خلال 5 إلى 10 أيام عمل بعد فحص المنتج المرتجع والموافقة عليه.',
            'في حالة وجود فرق سعر، يتم تحصيل الفرق أو إرجاعه حسب عملية الاستبدال.',
          ]
        : [
            'L’échange est possible selon disponibilité pour une autre taille/couleur.',
            'Le remboursement est traité sous 5 à 10 jours ouvrables après inspection et validation du retour.',
            'En cas d’écart de prix, la différence est facturée ou remboursée selon l’échange.',
          ],
    },
  ];

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="relative py-20 px-4 text-center bg-white border-b border-beige-200">
        <div className="absolute -top-16 -start-16 w-64 h-64 rounded-full bg-black/5 pointer-events-none" />
        <div className="absolute -bottom-20 -end-10 w-80 h-80 rounded-full bg-black/5 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-8 h-8 text-ink" />
          </div>
          <h1 className="text-4xl font-display font-bold text-ink mb-3">
            {isAr ? 'سياسة الإرجاع والاستبدال' : 'Politique de retour et échange'}
          </h1>
          <p className="text-ink/70 text-base max-w-2xl mx-auto">
            {isAr ? 'تفاصيل واضحة حول شروط الإرجاع، الاستبدال، واسترداد المبالغ.' : 'Règles claires concernant les retours, échanges et remboursements.'}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className={SECTION_CLASS}>
            <h2 className="text-xl font-display font-semibold text-leather-800 mb-3">{section.title}</h2>
            <ul className="space-y-2 text-sm text-leather-600 leading-relaxed">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
