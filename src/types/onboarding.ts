export interface SATProfile {
  examDate: string;
  targetScoreRW: string;
  targetScoreMath: string;
}

export interface OnboardingStep {
  id: keyof SATProfile;
  question: string;
  options: string[];
  responseTemplate: (selected: string) => string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}
