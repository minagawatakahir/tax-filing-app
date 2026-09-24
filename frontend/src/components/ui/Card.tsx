import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  color?: 'income' | 'property' | 'report' | 'dashboard' | 'neutral';
  variant?: 'default' | 'bordered' | 'elevated';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  footer,
  color = 'neutral',
  variant = 'default',
  children,
  className = '',
}) => {
  const colorStyles = {
    income: 'border-blue-200 bg-blue-50',
    property: 'border-green-200 bg-green-50',
    report: 'border-purple-200 bg-purple-50',
    dashboard: 'border-yellow-200 bg-yellow-50',
    neutral: 'border-gray-200 bg-white',
  };

  const variantStyles = {
    default: 'border shadow-sm',
    bordered: 'border-2 shadow-sm',
    elevated: 'shadow-lg',
  };

  const borderColor = {
    income: 'border-blue-200',
    property: 'border-green-200',
    report: 'border-purple-200',
    dashboard: 'border-yellow-200',
    neutral: 'border-gray-200',
  };

  return (
    <div
      className={`
        rounded-lg overflow-hidden transition-all duration-200
        ${variantStyles[variant]}
        ${colorStyles[color]}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className={`px-6 py-4 border-b ${borderColor[color]}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className={`px-6 py-4 bg-gray-50 border-t ${borderColor[color]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};
