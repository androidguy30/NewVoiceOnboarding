import { OnboardingStep } from "@/types/onboarding";

export const WELCOME_MESSAGE =
  "Hi there! I'm your SAT prep assistant. Let me help set up your personalized study plan. I just have a few quick questions for you.";

export const COMPLETION_MESSAGE = (profile: {
  grade: string;
  location: string;
  school: string;
  examDate: string;
  targetScoreRW: string;
  targetScoreMath: string;
  studyHoursPerWeek: string;
}) =>
  `Awesome, here's your profile:\n\n` +
  `Grade: ${profile.grade}\n` +
  `Location: ${profile.location}\n` +
  `School: ${profile.school}\n` +
  `SAT Exam: ${profile.examDate}\n` +
  `R&W Target: ${profile.targetScoreRW}\n` +
  `Math Target: ${profile.targetScoreMath}\n` +
  `Study Time: ${profile.studyHoursPerWeek}\n\n` +
  `I'm setting up your personalized study plan now. Let's crush it!`;

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "grade",
    question: "What grade are you in?",
    inputMode: "chips",
    options: [
      "8th Grade",
      "9th Grade",
      "10th Grade",
      "11th Grade",
      "12th Grade",
      "Graduated",
    ],
    responseTemplate: (selected) =>
      `${selected} — great! Let's get you set up.`,
  },
  {
    id: "location",
    question: "Where are you located?",
    inputMode: "chips-then-text",
    options: ["Within US", "Outside US"],
    followUpPrompt: "Please say your city and state or country.",
    followUpPlaceholder: "e.g. New York, NY",
    responseTemplate: (selected) =>
      `Got it — ${selected}. Thanks for sharing!`,
    validationField: "location",
  },
  {
    id: "school",
    question: "What school do you attend?",
    inputMode: "text",
    textPlaceholder: "Say your school name",
    responseTemplate: (selected) =>
      `${selected} — awesome! Let's keep going.`,
    validationField: "school",
  },
  {
    id: "examDate",
    question: "When are you planning to take the SAT Exam?",
    inputMode: "chips",
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
    inputMode: "chips",
    options: ["400–500", "500–600", "600–700", "700–800"],
    responseTemplate: (selected) =>
      `Aiming for ${selected} in R&W — solid goal!`,
  },
  {
    id: "targetScoreMath",
    question: "What's your target score for Math?",
    inputMode: "chips",
    options: ["400–500", "500–600", "600–700", "700–800"],
    responseTemplate: (selected) =>
      `${selected} for Math — nice target!`,
  },
  {
    id: "studyHoursPerWeek",
    question: "How many hours per week can you study?",
    inputMode: "chips",
    options: [
      "Less than 5 hours",
      "5–10 hours",
      "10–15 hours",
      "15–20 hours",
      "20+ hours",
    ],
    responseTemplate: (selected) =>
      `${selected} per week — perfect, I've got everything I need!`,
  },
];
