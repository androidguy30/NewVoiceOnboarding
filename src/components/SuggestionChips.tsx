"use client";

interface SuggestionChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled: boolean;
}

export default function SuggestionChips({
  options,
  onSelect,
  disabled,
}: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 animate-fade-in">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2.5 rounded-xl border border-violet-200 bg-white text-sm font-medium text-violet-700 hover:bg-violet-50 hover:border-violet-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
