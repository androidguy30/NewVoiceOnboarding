export interface SATProfile {
  grade: string;
  location: string;
  school: string;
  examDate: string;
  targetScoreRW: string;
  targetScoreMath: string;
  studyHoursPerWeek: string;
}

export type StepInputMode = "chips" | "text" | "chips-then-text";

export interface OnboardingStep {
  id: keyof SATProfile;
  question: string;
  inputMode: StepInputMode;
  options?: string[];
  textPlaceholder?: string;
  /** For "chips-then-text": prompt shown after chip selection */
  followUpPrompt?: string;
  followUpPlaceholder?: string;
  responseTemplate: (selected: string) => string;
  /** Field name to validate via /api/validate (e.g. "location", "school") */
  validationField?: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}
