import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ options, value, onChange, placeholder = "Select...", icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative transition-all duration-300 ${isOpen ? 'mb-2' : ''}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 bg-surface border rounded-xl hover:border-primary/50 min-w-[140px] w-full md:w-auto ${
          isOpen ? 'border-primary ring-2 ring-primary/10' : 'border-surfaceBorder'
        } text-textPrimary shadow-sm`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="w-4 h-4 text-textSecondary" />}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-textSecondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-60 mt-2 opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        }`}
      >
        <div className="w-full min-w-[180px] bg-surface border border-surfaceBorder rounded-2xl shadow-lg">
          <div className="p-1 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-surfaceBorder">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors rounded-xl group ${
                  value === option.value 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-textPrimary hover:bg-surfaceBorder'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
