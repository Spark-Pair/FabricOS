
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'max-w-lg'
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative bg-white rounded-[3rem] w-full ${maxWidth} overflow-hidden shadow-2xl flex flex-col max-h-[90vh]`}
          >
            <div className="p-8 md:p-10 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30 shrink-0">
              <div className="flex items-center gap-5">
                {icon && (
                  <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    {icon}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-black text-slate-800 leading-tight">{title}</h3>
                  {subtitle && (
                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-white rounded-full transition-all text-slate-400 hover:text-slate-600 active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
