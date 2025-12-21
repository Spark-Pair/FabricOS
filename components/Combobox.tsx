
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ComboboxOption {
  id: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  label,
  className = "",
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.id === value), 
  [options, value]);

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.sublabel?.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return;
    onChange(option.id);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center min-h-[56px] px-4 bg-slate-50 border-2 transition-all cursor-pointer rounded-2xl ${
          isOpen ? 'border-indigo-500 bg-white ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          {icon && <div className={`transition-colors ${isOpen ? 'text-indigo-500' : 'text-slate-300'}`}>{icon}</div>}
          <div className="flex flex-col overflow-hidden">
            <span className={`font-bold truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-700'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.sublabel && (
              <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{selectedOption.sublabel}</span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 z-[60] bg-white border border-slate-100 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                type="text"
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-600 placeholder:text-slate-300 py-1"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {query && (
                <button onClick={(e) => { e.stopPropagation(); setQuery(''); }} className="p-1 hover:bg-white rounded-lg">
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 font-medium italic">No results matching "{query}"</p>
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
                    className={`flex items-center justify-between p-3.5 rounded-xl transition-all cursor-pointer ${
                      opt.disabled 
                        ? 'opacity-40 cursor-not-allowed' 
                        : value === opt.id 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {value === opt.id && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
