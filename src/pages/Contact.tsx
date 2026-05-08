import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import {
  Phone, Mail, MapPin, MessageCircle, Clock, Send,
  CheckCircle2, User, Tag, MessageSquare, Loader2,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

// ── Types ────────────────────────────────────────────────────────────────────

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ── Animation variants ────────────────────────────────────────────────────────

const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-beige-200 bg-white text-leather-800 placeholder-leather-300 focus:outline-none focus:ring-2 focus:ring-leather-400 focus:border-transparent transition text-sm';

// ── Info card ─────────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
  href,
  custom,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  custom?: number;
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-full bg-leather-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-leather-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-leather-800 font-medium text-sm">{value}</p>
      </div>
    </div>
  );

  return (
    <motion.div
      custom={custom}
      variants={slideUp}
      className="bg-white rounded-2xl p-5 shadow-sm border border-beige-100 hover:shadow-md transition-shadow"
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Contact() {
  const { t, lang, dir } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const mutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const { error } = await supabase.from('contact_messages').insert([
        {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          lang,
        },
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setSubmitted(true);
      reset();
      toast.success(t('messageSent'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('error'));
    },
  });

  const onSubmit = (data: ContactForm) => mutation.mutate(data);

  const infoCards = [
    {
      icon: <Phone className="w-5 h-5 text-leather-500" />,
      label: lang === 'ar' ? 'الهاتف' : 'Téléphone',
      value: '+212 600-000000',
      href: 'tel:+212600000000',
    },
    {
      icon: <Mail className="w-5 h-5 text-leather-500" />,
      label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
      value: 'contact@cuir.ma',
      href: 'mailto:contact@cuir.ma',
    },
    {
      icon: <MapPin className="w-5 h-5 text-leather-500" />,
      label: lang === 'ar' ? 'العنوان' : 'Adresse',
      value: lang === 'ar' ? 'مراكش، المغرب' : 'Marrakech, Maroc',
    },
    {
      icon: <Clock className="w-5 h-5 text-leather-500" />,
      label: t('workingHours'),
      value: t('workingHoursValue'),
    },
  ];

  return (
    <div className="min-h-screen bg-beige-50" dir={dir}>
      {/* ── Hero ── */}
      <div
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B5E3C 0%, #63432a 60%, #4e3421 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -start-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -end-10 w-80 h-80 rounded-full bg-white/5" />

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gold-300" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-3">{t('contactTitle')}</h1>
          <p className="text-beige-100/80 text-base max-w-md mx-auto">{t('contactSubtitle')}</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Left: Contact form ── */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-leather-800 mb-6">
                {lang === 'ar' ? 'أرسل لنا رسالة' : 'Envoyez-nous un message'}
              </h2>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-12 text-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-leather-800">
                      {lang === 'ar' ? 'شكراً / Merci' : 'Merci / شكراً'}
                    </h3>
                    <p className="text-leather-500">{t('messageSent')}</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-2 px-6 py-2.5 bg-leather-500 text-white rounded-full text-sm font-semibold hover:bg-leather-600 transition-colors"
                    >
                      {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Envoyer un autre message'}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-leather-700 mb-1.5">
                        {t('fullName')}
                      </label>
                      <div className="relative">
                        <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                        <input
                          {...register('name', {
                            required: lang === 'ar' ? 'الاسم مطلوب' : 'Nom requis',
                            minLength: { value: 2, message: lang === 'ar' ? 'حرفان على الأقل' : 'Au moins 2 caractères' },
                          })}
                          className={`${inputClass} ps-10`}
                          placeholder={lang === 'ar' ? 'أحمد بنعلي' : 'Ahmed Benali'}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-leather-700 mb-1.5">
                        {t('email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                        <input
                          {...register('email', {
                            required: lang === 'ar' ? 'البريد مطلوب' : 'Email requis',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: t('invalidEmail'),
                            },
                          })}
                          type="email"
                          className={`${inputClass} ps-10`}
                          placeholder="exemple@email.com"
                          dir="ltr"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-leather-700 mb-1.5">
                        {t('subject')}
                      </label>
                      <div className="relative">
                        <Tag className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-400" />
                        <input
                          {...register('subject', {
                            required: lang === 'ar' ? 'الموضوع مطلوب' : 'Sujet requis',
                          })}
                          className={`${inputClass} ps-10`}
                          placeholder={
                            lang === 'ar'
                              ? 'استفسار عن منتج / مشكلة في الطلب...'
                              : 'Question sur un produit / Problème de commande...'
                          }
                        />
                      </div>
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-leather-700 mb-1.5">
                        {t('message')}
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute start-3 top-3 w-4 h-4 text-leather-400" />
                        <textarea
                          {...register('message', {
                            required: lang === 'ar' ? 'الرسالة مطلوبة' : 'Message requis',
                            minLength: { value: 10, message: lang === 'ar' ? '10 أحرف على الأقل' : 'Au moins 10 caractères' },
                          })}
                          rows={5}
                          className={`${inputClass} ps-10 resize-none`}
                          placeholder={
                            lang === 'ar'
                              ? 'اكتب رسالتك هنا...'
                              : 'Écrivez votre message ici...'
                          }
                        />
                      </div>
                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full py-3.5 bg-leather-500 text-white rounded-xl font-bold hover:bg-leather-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      whileTap={{ scale: 0.98 }}
                    >
                      {mutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          {t('sendMessage')}
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Right: Contact info ── */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {infoCards.map((card, i) => (
              <InfoCard key={i} {...card} custom={i} />
            ))}

            {/* WhatsApp CTA */}
            <motion.div
              custom={infoCards.length}
              variants={slideUp}
              className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-2xl p-6 text-white shadow-md"
            >
              <MessageCircle className="w-8 h-8 mb-3 opacity-90" />
              <p className="font-bold text-lg mb-1">{t('whatsapp')}</p>
              <p className="text-white/80 text-sm mb-4">
                {lang === 'ar'
                  ? 'تحدث معنا مباشرة على واتساب للحصول على رد فوري'
                  : 'Discutez avec nous directement sur WhatsApp pour une réponse immédiate'}
              </p>
              <a
                href="https://wa.me/212600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#128C7E] rounded-full font-bold text-sm hover:bg-green-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {lang === 'ar' ? 'ابدأ المحادثة' : 'Démarrer la conversation'}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
