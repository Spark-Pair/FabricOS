
import React from 'react';
import { useTenant } from '../contexts/TenantContext';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({ 
  children, 
  variant = 'primary', 
  disabled, 
  onClick, 
  ...props 
}) => {
  const { isReadOnly } = useTenant();

  const styles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const isDisabled = isReadOnly || disabled;

  return (
    <button
      {...props}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${props.className || ''}`}
    >
      {children}
    </button>
  );
};
