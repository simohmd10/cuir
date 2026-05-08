import type { Language } from '../i18n';

export function formatPrice(amount: number, lang: Language = 'ar'): string {
  const formatted = new Intl.NumberFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return lang === 'ar' ? `${formatted} د.م.` : `${formatted} DH`;
}

export function generateOrderRef(): string {
  const prefix = 'CU';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string, lang: Language): string {
  const labels: Record<string, { ar: string; fr: string }> = {
    pending: { ar: 'قيد الانتظار', fr: 'En attente' },
    processing: { ar: 'قيد المعالجة', fr: 'En traitement' },
    shipped: { ar: 'تم الشحن', fr: 'Expédié' },
    delivered: { ar: 'تم التسليم', fr: 'Livré' },
    cancelled: { ar: 'ملغي', fr: 'Annulé' },
  };
  return labels[status]?.[lang] || status;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getImageUrl(path: string, fallback?: string): string {
  if (!path) return fallback || '/placeholder-bag.jpg';
  if (path.startsWith('http')) return path;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return fallback || '/placeholder-bag.jpg';
  return `${supabaseUrl}/storage/v1/object/public/products/${path}`;
}

export function formatDate(dateString: string, lang: Language): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : 'fr-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export const MOROCCAN_CITIES = [
  'الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أكادير', 'مكناس',
  'وجدة', 'القنيطرة', 'تطوان', 'الجديدة', 'سطات', 'خريبكة', 'بني ملال',
  'الناظور', 'تازة', 'الصويرة', 'إفران', 'ورزازات', 'زاكورة',
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
];
