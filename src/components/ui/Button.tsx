// src/components/ui/Button.tsx
// Enhanced button component with sci-fi styling and micro-interactions
// Replaces the complex design system button with a simpler, more reliable version

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glowEffect?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glowEffect = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium
    transition-all relative overflow-hidden
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
    active:scale-95 hover:scale-[1.02] duration-100 ease-out
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl',
    lg: 'px-6 py-4 text-lg rounded-xl'
  };

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-indigo-500 text-white
      hover:from-blue-600 hover:to-indigo-600
      border border-blue-400 border-opacity-30
      shadow-lg shadow-blue-500/25
    `,
    secondary: `
      bg-slate-700 bg-opacity-50 text-white border border-slate-600
      hover:bg-slate-600 hover:bg-opacity-70
      backdrop-blur-sm
    `,
    ghost: `
      bg-transparent text-slate-300 border border-transparent
      hover:bg-slate-700 hover:bg-opacity-30 hover:text-white
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500 text-white
      hover:from-red-600 hover:to-pink-600
      border border-red-400 border-opacity-30
      shadow-lg shadow-red-500/25
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500 text-white
      hover:from-green-600 hover:to-emerald-600
      border border-green-400 border-opacity-30
      shadow-lg shadow-green-500/25
    `,
    ai: `
      bg-gradient-to-r from-purple-500 to-pink-500 text-white
      hover:from-purple-600 hover:to-pink-600
      border border-purple-400 border-opacity-30
      shadow-lg shadow-purple-500/25
      ${glowEffect ? 'animate-pulse' : ''}
    `
  };

  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glow overlay for AI buttons */}
      {variant === 'ai' && glowEffect && (
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 blur-lg rounded-xl pointer-events-none" />
      )}

      {/* Optional shimmer overlay — use CSS if needed */}
      {(glowEffect || isLoading) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-[shimmer_1.5s_linear_infinite] pointer-events-none" />
      )}

      <div className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex items-center">{leftIcon}</span>
        ) : null}

        {children && (
          <span className={isLoading ? 'opacity-70' : ''}>
            {children}
          </span>
        )}

        {rightIcon && !isLoading && (
          <span className="flex items-center">{rightIcon}</span>
        )}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
