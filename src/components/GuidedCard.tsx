"use client";

import { useState } from "react";
import VoiceInput from "@/components/VoiceInput";

interface GuidedCardProps {
  stepNumber: number;
  totalSteps: number;
  question: string;
  subtitle?: string;
  icon: string;
  options?: string[];
  showVoiceInput?: boolean;
  voicePlaceholder?: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  selectedValue?: string;
}

const stepIcons: Record<string, string> = {
  grade:
    "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0121 12.75c0 2.278-.658 4.408-1.84 6.25L12 14z",
  location:
    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  school:
    "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  examDate:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  targetScoreRW:
    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  targetScoreMath:
    "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  studyHoursPerWeek:
    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

export { stepIcons };

export default function GuidedCard({
  stepNumber,
  totalSteps,
  question,
  subtitle,
  icon,
  options,
  showVoiceInput,
  voicePlaceholder,
  onSelect,
  disabled,
  selectedValue,
}: GuidedCardProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  return (
    <div className="w-full max-w-lg mx-auto animate-card-enter">
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 px-6 py-8 text-center relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full border-4 border-white" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={icon}
                />
              </svg>
            </div>
            <p className="text-violet-200 text-xs font-medium uppercase tracking-wider mb-2">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2 className="text-xl font-bold text-white leading-snug">
              {question}
            </h2>
            {subtitle && (
              <p className="text-violet-200 text-sm mt-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Card Body — Options */}
        <div className="px-5 py-6">
          {options && options.length > 0 && (
            <div className="grid gap-2.5">
              {options.map((option) => {
                const isSelected = selectedValue === option;
                const isHovered = hoveredOption === option;
                return (
                  <button
                    key={option}
                    onClick={() => onSelect(option)}
                    onMouseEnter={() => setHoveredOption(option)}
                    onMouseLeave={() => setHoveredOption(null)}
                    disabled={disabled}
                    className={`relative w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? "border-violet-500 bg-violet-50 shadow-md"
                        : isHovered
                          ? "border-violet-300 bg-violet-50/50 shadow-sm"
                          : "border-gray-150 bg-gray-50 hover:border-violet-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-violet-700" : "text-gray-700"
                        }`}
                      >
                        {option}
                      </span>
                      {/* Selection indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-violet-500 bg-violet-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Voice Input for text/voice steps */}
          {showVoiceInput && (
            <div className="mt-2">
              <VoiceInput
                onResult={onSelect}
                disabled={disabled || false}
                placeholder={voicePlaceholder}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
