"use client";

interface ProgressBarProps {
  progress: number; // 0-100
}

const stages = [
  "Exam timeline",
  "R&W target score",
  "Math target score",
  "All set!",
];

export default function ProgressBar({ progress }: ProgressBarProps) {
  const stageIndex = Math.min(
    Math.floor(progress / 34),
    stages.length - 1
  );

  return (
    <div className="px-6 py-3 bg-white border-b border-gray-100">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-500">
            {stages[stageIndex]}
          </span>
          <span className="text-xs font-medium text-violet-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
