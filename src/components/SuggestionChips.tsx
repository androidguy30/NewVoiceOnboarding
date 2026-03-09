"use client";

import { useState } from "react";

interface SuggestionChipsProps {
  options?: string[];
  onSelect: (option: string) => void;
  disabled: boolean;
  showTextInput?: boolean;
  textPlaceholder?: string;
}

export default function SuggestionChips({
  options,
  onSelect,
  disabled,
  showTextInput,
  textPlaceholder = "Type your answer...",
}: SuggestionChipsProps) {
  const [textValue, setTextValue] = useState("");

  const handleTextSubmit = () => {
    const trimmed = textValue.trim();
    if (trimmed && !disabled) {
      onSelect(trimmed);
      setTextValue("");
    }
  };

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

      {/* Text input */}
      {showTextInput && (
        <div className={`flex items-center gap-2 ${options && options.length > 0 ? "mt-3" : ""}`}>
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
            disabled={disabled}
            placeholder={textPlaceholder}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            autoFocus
          />
          <button
            onClick={handleTextSubmit}
            disabled={disabled || !textValue.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
