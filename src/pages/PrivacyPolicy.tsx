import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CARD_CLASS = 'bg-white border border-beige-200 rounded-2xl p-6 md:p-7 shadow-sm';

export default function PrivacyPolicy() {
  const { lang, dir } = useLanguage();
  const isAr = lang === 'ar';

  const sections = [
    {
      title: isAr ? 'البيانات التي نجمعها' : 'Données collectées',
      body: isAr
        ? 'نجمع بيانات ضرورية لتنفيذ الطلبات وخدمة العملاء مثل الاسم، رقم الهاتف، البريد الإلكتروني، عنوان الشحن، ومحتوى رسائل نموذج التواصل.'
        : 'Nous collectons les données nécessaires au traitement des commandes et au support client : nom, téléphone, email, adresse de livraison et messages du formulaire de contact.',
    },
    {
      title: isAr ? 'استخدام البيانات' : 'Utilisation des données',
      body: isAr
        ? 'نستخدم البيانات لتأكيد الطلبات، التوصيل، متابعة حالة الطلب، خدمة ما بعد البيع، وتحسين تجربة المستخدم داخل الموقع.'
        : 'Les données sont utilisées pour confirmer les commandes, assurer la livraison, suivre les statuts, gérer le service après-vente et améliorer l’expérience utilisateur.',
    },
    {
      title: isAr ? 'ملفات تعريف الارتباط (Cookies)' : 'Cookies',
      body: isAr
        ? 'نستخدم ملفات تعريف الارتباط لتحسين الأداء، حفظ تفضيلات التصفح الأساسية، وقياس استخدام الصفحات بشكل إجمالي وغير شخصي.'
        : 'Nous utilisons des cookies pour améliorer les performances, mémoriser les préférences essentielles et analyser l’usage global des pages.',
    },
    {
      title: isAr ? 'الدفع والأمان' : 'Paiement et sécurité',
      body: isAr
        ? 'نلتزم بحماية بيانات العملاء ونعتمد ممارسات أمان مناسبة. لا نقوم ببيع البيانات الشخصية لأي طرف ثالث.'
        : 'Nous appliquons des mesures de sécurité adaptées pour protéger les informations clients. Aucune donnée personnelle n’est vendue à des tiers.',
    },
    {
      title: isAr ? 'حقوق المستخدم' : 'Droits des utilisateurs',
      body: isAr
        ? 'يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها عبر التواصل معنا من صفحة الاتصال.'
        : 'Vous pouvez demander l’accès, la correction ou la suppression de vos données en nous contactant via la page contact.',
    },
  ];

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      <div className="relative py-20 px-4 text-center" style={{ background: 'linear-gradient(160deg, #1C1C1C 0%, #2D2926 100%)' }}>
        <div className="absolute -top-16 -start-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -end-10 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-gold-300" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">
            {isAr ? 'سياسة الخصوصية' : 'Politique de confidentialité'}
          </h1>
          <p className="text-beige-100/80 text-base max-w-2xl mx-auto">
            {isAr ? 'كيف نجمع بياناتك ونستخدمها ونحميها.' : 'Comment nous collectons, utilisons et protégeons vos données.'}
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className={CARD_CLASS}>
            <h2 className="text-xl font-display font-semibold text-leather-800 mb-2">{section.title}</h2>
            <p className="text-sm text-leather-600 leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
