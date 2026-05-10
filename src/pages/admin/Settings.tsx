import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Save, Store, Phone, Mail, Truck, Gift } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

// ─── Schema ───────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  store_name: z.string().min(1, 'Nom du magasin requis'),
  whatsapp_number: z.string().min(9, 'Numéro WhatsApp invalide'),
  delivery_fee: z.coerce.number().min(0, 'Frais de livraison >= 0'),
  free_delivery_threshold: z.coerce.number().min(0),
  store_email: z.string().email('Email invalide').or(z.literal('')),
  store_phone: z.string().default(''),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// ─── Fetch / Save ─────────────────────────────────────────────────────────────

const SETTING_KEYS = [
  'store_name',
  'whatsapp_number',
  'delivery_fee',
  'free_delivery_threshold',
  'store_email',
  'store_phone',
] as const;

async function fetchSettings(): Promise<SettingsForm> {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', SETTING_KEYS as unknown as string[]);

  if (error) throw error;

  const map: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => { map[row.key] = row.value; });

  return {
    store_name: map.store_name ?? 'Cuir Maroc',
    whatsapp_number: map.whatsapp_number ?? '',
    delivery_fee: Number(map.delivery_fee ?? 30),
    free_delivery_threshold: Number(map.free_delivery_threshold ?? 500),
    store_email: map.store_email ?? '',
    store_phone: map.store_phone ?? '',
  };
}

async function saveSettings(form: SettingsForm) {
  const rows = Object.entries(form).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) throw error;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Sk: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-leather-100 rounded-lg ${className}`} />
);

// ─── Field component ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, error, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-medium text-leather-700 mb-1.5">
      <span className="text-leather-400">{icon}</span>
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { lang } = useLanguage();
  const qc = useQueryClient();

  const { data: defaultValues, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultValues,
  });

  // Populate form when data arrives
  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success(lang === 'ar' ? 'تم حفظ الإعدادات' : 'Paramètres enregistrés');
    },
    onError: (err: Error) => toast.error(err.message || 'Erreur lors de la sauvegarde'),
  });

  const inputClass = (hasError?: boolean) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leather-400 transition-colors ${
      hasError ? 'border-red-400 bg-red-50' : 'border-leather-200 bg-white text-leather-800'
    }`;

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-leather-800">
            {lang === 'ar' ? 'إعدادات المتجر' : 'Paramètres du magasin'}
          </h1>
          <p className="text-sm text-leather-400 mt-0.5">
            {lang === 'ar' ? 'تكوين معلومات المتجر والتوصيل' : 'Configurez les informations du magasin et la livraison'}
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-leather-100 p-6 space-y-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Sk className="h-4 w-36" />
                <Sk className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            {/* Store info card */}
            <div className="bg-white rounded-xl border border-leather-100 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-leather-700 flex items-center gap-2">
                <Store size={16} className="text-leather-400" />
                {lang === 'ar' ? 'معلومات المتجر' : 'Informations du magasin'}
              </h2>

              <Field
                label={lang === 'ar' ? 'اسم المتجر' : 'Nom du magasin'}
                icon={<Store size={15} />}
                error={errors.store_name?.message}
              >
                <input
                  {...register('store_name')}
                  className={inputClass(!!errors.store_name)}
                  placeholder="Cuir Maroc"
                />
              </Field>

              <Field
                label={lang === 'ar' ? 'رقم واتساب' : 'Numéro WhatsApp'}
                icon={<Phone size={15} />}
                error={errors.whatsapp_number?.message}
              >
                <input
                  {...register('whatsapp_number')}
                  className={inputClass(!!errors.whatsapp_number)}
                  placeholder="+212691553120"
                  dir="ltr"
                />
              </Field>

              <Field
                label={lang === 'ar' ? 'بريد المتجر الإلكتروني' : 'Email du magasin'}
                icon={<Mail size={15} />}
                error={errors.store_email?.message}
              >
                <input
                  {...register('store_email')}
                  type="email"
                  className={inputClass(!!errors.store_email)}
                  placeholder="contact@cuir.ma"
                  dir="ltr"
                />
              </Field>

              <Field
                label={lang === 'ar' ? 'هاتف المتجر' : 'Téléphone du magasin'}
                icon={<Phone size={15} />}
                error={errors.store_phone?.message}
              >
                <input
                  {...register('store_phone')}
                  className={inputClass(!!errors.store_phone)}
                  placeholder="0691553120"
                  dir="ltr"
                />
              </Field>
            </div>

            {/* Delivery card */}
            <div className="bg-white rounded-xl border border-leather-100 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-semibold text-leather-700 flex items-center gap-2">
                <Truck size={16} className="text-leather-400" />
                {lang === 'ar' ? 'إعدادات التوصيل' : 'Paramètres de livraison'}
              </h2>

              <Field
                label={lang === 'ar' ? 'رسوم التوصيل (DH)' : 'Frais de livraison (DH)'}
                icon={<Truck size={15} />}
                error={errors.delivery_fee?.message}
              >
                <div className="relative">
                  <input
                    type="number"
                    {...register('delivery_fee')}
                    className={inputClass(!!errors.delivery_fee)}
                    min="0"
                    step="5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-leather-400 text-sm font-medium pointer-events-none">DH</span>
                </div>
              </Field>

              <Field
                label={lang === 'ar' ? 'حد التوصيل المجاني (DH)' : 'Seuil livraison gratuite (DH)'}
                icon={<Gift size={15} />}
                error={errors.free_delivery_threshold?.message}
              >
                <div className="relative">
                  <input
                    type="number"
                    {...register('free_delivery_threshold')}
                    className={inputClass(!!errors.free_delivery_threshold)}
                    min="0"
                    step="50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-leather-400 text-sm font-medium pointer-events-none">DH</span>
                </div>
                <p className="text-xs text-leather-400 mt-1">
                  {lang === 'ar'
                    ? 'يتم توفير التوصيل مجانًا للطلبات التي تتجاوز هذا المبلغ'
                    : 'La livraison est gratuite pour les commandes dépassant ce montant'}
                </p>
              </Field>
            </div>

            {/* Save button */}
            <div className="flex items-center justify-between">
              {isDirty && !saveMutation.isSuccess && (
                <p className="text-xs text-amber-600">
                  {lang === 'ar' ? 'لديك تغييرات غير محفوظة' : 'Vous avez des modifications non enregistrées'}
                </p>
              )}
              {saveMutation.isSuccess && !isDirty && (
                <p className="text-xs text-green-600">
                  {lang === 'ar' ? 'تم الحفظ بنجاح' : 'Paramètres enregistrés avec succès'}
                </p>
              )}
              <div className="flex-1" />
              <button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-leather-500 text-white rounded-lg text-sm font-medium hover:bg-leather-600 transition-colors disabled:opacity-60 shadow-sm"
              >
                {saveMutation.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {lang === 'ar' ? 'حفظ الإعدادات' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default Settings;
