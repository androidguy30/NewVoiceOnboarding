import { OnboardingStep } from "@/types/onboarding";

export const WELCOME_MESSAGE =
  "Hi there! I'm your SAT prep assistant. Let me help set up your personalized study plan. I just have a few quick questions for you.";

export const COMPLETION_MESSAGE = (profile: {
  examDate: string;
  targetScoreRW: string;
  targetScoreMath: string;
}) =>
  `Great choices! Here's a quick summary:\n\n` +
  `SAT Exam: ${profile.examDate}\n` +
  `R&W Target: ${profile.targetScoreRW}\n` +
  `Math Target: ${profile.targetScoreMath}\n\n` +
  `I'm setting up your personalized study plan now. Let's get you there!`;

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "examDate",
    question: "When are you planning to take the SAT Exam?",
    options: [
      "Within 1 month",
      "In 2–3 months",
      "In 3–6 months",
      "6+ months away",
      "Not sure yet",
    ],
    responseTemplate: (selected) =>
      `${selected} — got it! That helps me plan the right pace for you.`,
  },
  {
    id: "targetScoreRW",
    question: "What's your target score for Reading & Writing?",
    options: ["400–500", "500–600", "600–700", "700–800"],
    responseTemplate: (selected) =>
      `Aiming for ${selected} in R&W — solid goal! Let's make it happen.`,
  },
  {
    id: "targetScoreMath",
    question: "And what's your target score for Math?",
    options: ["400–500", "500–600", "600–700", "700–800"],
    responseTemplate: (selected) =>
      `${selected} for Math — nice! I've got everything I need.`,
  },
];
