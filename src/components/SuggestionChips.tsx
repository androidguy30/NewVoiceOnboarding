"use client";

import VoiceInput from "@/components/VoiceInput";

interface SuggestionChipsProps {
  options?: string[];
  onSelect: (option: string) => void;
  disabled: boolean;
  showVoiceInput?: boolean;
  voicePlaceholder?: string;
}

export default function SuggestionChips({
  options,
  onSelect,
  disabled,
  showVoiceInput,
  voicePlaceholder = "Tap the mic and speak...",
}: SuggestionChipsProps) {
  return (
    <div className="px-4 py-3 animate-fade-in">
      {/* Chip options */}
      {options && options.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
      )}

      {/* Voice input (speech-to-text) */}
      {showVoiceInput && (
        <div className={options && options.length > 0 ? "mt-4" : ""}>
          <VoiceInput
            onResult={onSelect}
            disabled={disabled}
            placeholder={voicePlaceholder}
          />
        </div>
      )}
    </div>
  );
}
