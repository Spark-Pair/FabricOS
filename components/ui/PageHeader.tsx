
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
    <div>
      <h2 className="text-4xl font-black text-slate-800 tracking-tight">{title}</h2>
      <p className="text-slate-500 mt-2 font-medium italic" dangerouslySetInnerHTML={{ __html: subtitle }} />
    </div>
    <div className="flex gap-3 items-center">
      {actions}
    </div>
  </header>
);
