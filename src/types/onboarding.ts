export interface LearnerProfile {
  name: string;
  age: string;
  learningGoals: string[];
  currentSkillLevel: string;
  preferredLearningStyle: string;
  interests: string[];
  priorExperience: string;
  availableTime: string;
  preferredLanguage: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

export interface OnboardingState {
  messages: ChatMessage[];
  profile: Partial<LearnerProfile>;
  isComplete: boolean;
  isLoading: boolean;
}
