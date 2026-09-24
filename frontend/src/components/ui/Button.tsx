import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  color = 'neutral',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
  };

  const variantColorStyles = {
    income: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    property: {
      primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      secondary: 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500',
      ghost: 'text-green-600 hover:bg-green-50 focus:ring-green-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    report: {
      primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
      secondary: 'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-purple-500',
      outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
      ghost: 'text-purple-600 hover:bg-purple-50 focus:ring-purple-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    dashboard: {
      primary: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      secondary: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-500',
      outline: 'border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      ghost: 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
    neutral: {
      primary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
      outline: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    },
  };

  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantColorStyles[color][variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
