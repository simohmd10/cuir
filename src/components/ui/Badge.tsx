import React from 'react';

type BadgeVariant = 'leather' | 'gold' | 'green' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  leather: 'bg-leather-100 text-leather-700 border border-leather-300',
  gold: 'bg-amber-50 text-gold-600 border border-gold-300',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-300',
  red: 'bg-red-50 text-red-700 border border-red-300',
  blue: 'bg-blue-50 text-blue-700 border border-blue-300',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'leather', className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
