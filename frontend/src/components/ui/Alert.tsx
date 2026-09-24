import React from 'react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  closable?: boolean;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  closable = true,
  icon,
}) => {
  const variantStyles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-800',
      message: 'text-green-700',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-800',
      message: 'text-red-700',
      icon: '✕',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      icon: '⚠',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      message: 'text-blue-700',
      icon: 'ℹ',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border rounded-lg p-4 flex items-start gap-3
        transition-all duration-200
      `}
      role="alert"
    >
      {icon || (
        <span className={`text-lg font-bold ${styles.title}`}>
          {styles.icon}
        </span>
      )}
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${styles.title}`}>{title}</h4>
        )}
        <p className={`${styles.message} ${title ? 'mt-1' : ''}`}>
          {message}
        </p>
      </div>
      {closable && onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${styles.title} hover:opacity-75 transition-opacity`}
          aria-label="Close"
        >
          ✕
        </button>
      )}
    </div>
  );
};
