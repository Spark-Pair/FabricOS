
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, action }) => (
  <div className="text-center py-40 opacity-40 flex flex-col items-center justify-center grow">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
      {icon}
    </div>
    <p className="font-black uppercase tracking-widest text-xs mb-4">{message}</p>
    {action}
  </div>
);
