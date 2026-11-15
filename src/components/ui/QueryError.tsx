import React from 'react';

/**
 * État d'erreur partagé pour les requêtes de données.
 *
 * Sans lui, une requête qui échoue retombe sur le même rendu qu'un catalogue
 * vide : « 0 produit ». Impossible alors de distinguer une base non
 * configurée, un schéma non appliqué et une boutique réellement vide.
 */

/** Vrai quand VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquent au build. */
export function isSupabaseUnconfigured(): boolean {
  return (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

interface QueryErrorProps {
  lang: 'ar' | 'fr';
  onRetry?: () => void;
  /** Rendu compact, pour une section plutôt qu'une page entière. */
  compact?: boolean;
}

const QueryError: React.FC<QueryErrorProps> = ({ lang, onRetry, compact = false }) => {
  const isAr = lang === 'ar';
  const unconfigured = isSupabaseUnconfigured();

  return (
    <div
      className={[
        'flex flex-col items-center text-center',
        compact ? 'py-10 gap-3' : 'py-20 gap-4',
      ].join(' ')}
      role="alert"
    >
      <div className="w-px h-8 bg-cream-400" aria-hidden="true" />

      <p
        className={[
          'text-ink/70',
          isAr ? 'font-arabic text-base' : 'font-display text-lg',
        ].join(' ')}
      >
        {isAr
          ? 'تعذّر تحميل المنتجات'
          : 'Impossible de charger les produits'}
      </p>

      <p
        className={[
          'max-w-sm text-ink/40',
          isAr ? 'font-arabic text-sm' : 'font-body text-xs leading-relaxed',
        ].join(' ')}
      >
        {isAr
          ? 'يبدو أن الاتصال بالخادم انقطع. تحقّق من اتصالك ثم أعد المحاولة.'
          : 'La connexion au serveur a échoué. Vérifiez votre connexion puis réessayez.'}
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-1">
          {isAr ? 'إعادة المحاولة' : 'Réessayer'}
        </button>
      )}

      {/*
        Ce cas ne peut pas se produire sur un déploiement correct : il signifie
        que le build s'est fait sans les variables Supabase, et que le client
        pointe donc vers l'URL de repli. Message destiné à l'exploitant.
      */}
      {unconfigured && (
        <p className="mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left font-mono text-[11px] leading-relaxed text-amber-800">
          Configuration manquante : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
          n'étaient pas définies au moment du build. Ajoutez-les dans Vercel
          (Settings → Environment Variables) puis relancez un déploiement.
        </p>
      )}
    </div>
  );
};

export default QueryError;
