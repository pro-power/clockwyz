// src/design-system/components/atoms/Button/Button.tsx
// Modern button component using design token system
// Supports multiple variants, sizes, states, and accessibility features

import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { framerMotionPresets } from '../../../tokens/motion';

import './Button.module.css';

// Button variant types
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'ghost' 
  | 'danger' 
  | 'success';

// Button size types
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button state types
export type ButtonState = 'default' | 'loading' | 'disabled';

// Icon position
export type IconPosition = 'left' | 'right' | 'only';

// Button props interface
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // Content
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: ReactNode;
  
  // State
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingText?: string;
  
  // Layout
  fullWidth?: boolean;
  
  // Interaction
  href?: string;
  target?: string;
  
  // Animation
  disableAnimation?: boolean;
  
  // Custom styling
  className?: string;
}

// Loading spinner component
const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <motion.div
      className={`loading-spinner ${sizeMap[size]}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          opacity="0.3"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="24"
        />
      </svg>
    </motion.div>
  );
};

// Main button component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      leftIcon,
      rightIcon,
      iconOnly,
      isLoading = false,
      isDisabled = false,
      loadingText,
      fullWidth = false,
      href,
      target,
      disableAnimation = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    // Determine if button is actually disabled
    const disabled = isDisabled || isLoading;
    
    // Build CSS classes
    const baseClasses = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      fullWidth && 'btn--full-width',
      disabled && 'btn--disabled',
      isLoading && 'btn--loading',
      iconOnly && 'btn--icon-only',
      className
    ]
      .filter(Boolean)
      .join(' ');

    // Animation props
    const animationProps = disableAnimation ? {} : {
      ...framerMotionPresets.hoverScale,
      ...framerMotionPresets.tapScale
    };

    // Handle click events
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      
      if (onClick) {
        onClick(e);
      }
    };

    // Render content
    const renderContent = () => {
      if (iconOnly) {
        return isLoading ? <LoadingSpinner size={size} /> : iconOnly;
      }

      return (
        <>
          {(leftIcon || isLoading) && (
            <span className="btn__icon btn__icon--left">
              {isLoading ? <LoadingSpinner size={size} /> : leftIcon}
            </span>
          )}
          
          {children && (
            <span className="btn__text">
              {isLoading && loadingText ? loadingText : children}
            </span>
          )}
          
          {rightIcon && !isLoading && (
            <span className="btn__icon btn__icon--right">
              {rightIcon}
            </span>
          )}
        </>
      );
    };

    // If href is provided, render as link
    if (href) {
      return (
        <motion.a
          href={disabled ? undefined : href}
          target={target}
          className={baseClasses}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          {...(disabled ? {} : animationProps)}
          {...(props as any)}
        >
          {renderContent()}
        </motion.a>
      );
    }

    // Render as button
    return (
      <motion.button
        ref={ref}
        type="button"
        className={baseClasses}
        disabled={disabled}
        onClick={handleClick}
        aria-disabled={disabled}
        aria-busy={isLoading}
        {...(disabled ? {} : animationProps)}
        {...props}
      >
        {renderContent()}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Button group component for related actions
export interface ButtonGroupProps {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  size,
  variant,
  orientation = 'horizontal',
  spacing = 'normal',
  className = ''
}) => {
  const groupClasses = [
    'btn-group',
    `btn-group--${orientation}`,
    `btn-group--spacing-${spacing}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  // Clone children to apply consistent props
  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<ButtonProps>(child) && child.type === Button) {
      return React.cloneElement(child, {
        size: child.props.size || size,
        variant: child.props.variant || variant,
        ...child.props
      });
    }
    return child;
  });

  return (
    <div className={groupClasses} role="group">
      {clonedChildren}
    </div>
  );
};

// Icon button variant for common use cases
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <Button
      {...props}
      iconOnly={icon}
      aria-label={ariaLabel}
      className={`btn--icon ${props.className || ''}`}
    />
  );
};

// Export button sub-components
export default Button;