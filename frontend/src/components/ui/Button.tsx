import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const styles = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800',
    secondary:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}