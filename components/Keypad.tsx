import React from 'react';

interface KeypadProps {
  options: number[];
  onSelect: (value: number) => void;
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ options, onSelect, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-sm mx-auto mt-6">
      {options.map((opt, idx) => (
        <button
          key={`${opt}-${idx}`}
          onPointerDown={(e) => {
            // Prevent default browser behavior (zooming, scrolling, ghost clicks)
            e.preventDefault();
            if (!disabled) {
              onSelect(opt);
            }
          }}
          disabled={disabled}
          className={`
            aspect-square flex items-center justify-center
            text-3xl font-bold rounded-xl shadow-lg transition-all active:scale-95
            bg-white text-slate-800 border-b-4 border-slate-200
            hover:bg-brand-50 hover:border-brand-200
            disabled:opacity-50 disabled:cursor-not-allowed
            touch-none select-none
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};