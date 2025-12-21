
import React from 'react';
import { useTenant } from '../contexts/TenantContext';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({ 
  children, 
  variant = 'primary', 
  disabled, 
  onClick, 
  ...props 
}) => {
  const { isReadOnly } = useTenant();

  const baseStyles = 'px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700',
    secondary: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    danger: 'bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700',
    warning: 'bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600'
  };

  const isDisabled = isReadOnly || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`${baseStyles} ${variants[variant]} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};
