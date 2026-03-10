"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SATProfile } from "@/types/onboarding";
import { onboardingSteps } from "@/lib/onboarding-steps";
import GuidedCard, { stepIcons } from "@/components/GuidedCard";

type SubPhase = "chips" | "text";

export default function OnboardingCardsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<SATProfile>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  // For chips-then-text steps
  const [subPhase, setSubPhase] = useState<SubPhase>("chips");
  const [chipSelection, setChipSelection] = useState("");

  // Animation direction for card transitions
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const step = currentStep < onboardingSteps.length ? onboardingSteps[currentStep] : null;
  const progress = Math.round((currentStep / onboardingSteps.length) * 100);

  const validateInput = async (
    field: string,
    value: string
  ): Promise<{ valid: boolean; corrected: string; message: string }> => {
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      if (!response.ok) return { valid: true, corrected: value, message: "" };
      return await response.json();
    } catch {
      return { valid: true, corrected: value, message: "" };
    }
  };

  const transitionToNext = useCallback(
    (updatedProfile: Partial<SATProfile>) => {
      const nextStep = currentStep + 1;
      setIsTransitioning(true);
      setDirection("forward");
      setValidationError("");

      setTimeout(() => {
        if (nextStep < onboardingSteps.length) {
          setCurrentStep(nextStep);
          setSubPhase("chips");
          setChipSelection("");
        } else {
          setIsComplete(true);
          const finalProfile = updatedProfile as SATProfile;
          localStorage.setItem("satProfile", JSON.stringify(finalProfile));
          setTimeout(() => router.push("/profile"), 1500);
        }
        setIsTransitioning(false);
      }, 400);
    },
    [currentStep, router]
  );

  const handleSelect = async (option: string) => {
    if (!step || isTransitioning || isValidating) return;

    setValidationError("");

    // chips-then-text: phase 1 — chip selected
    if (step.inputMode === "chips-then-text" && subPhase === "chips") {
      setChipSelection(option);
      setIsTransitioning(true);
      setTimeout(() => {
        setSubPhase("text");
        setIsTransitioning(false);
      }, 300);
      return;
    }

    // chips-then-text: phase 2 — voice/text input
    if (step.inputMode === "chips-then-text" && subPhase === "text") {
      if (step.validationField) {
        setIsValidating(true);
        const result = await validateInput(step.validationField, option);
        setIsValidating(false);
        if (!result.valid) {
          setValidationError(
            result.message || "That doesn't look right. Please try again."
          );
          return;
        }
        const corrected = result.corrected || option;
        const combined = `${chipSelection} — ${corrected}`;
        const updatedProfile = { ...profile, [step.id]: combined };
        setProfile(updatedProfile);
        transitionToNext(updatedProfile);
        return;
      }
      const combined = `${chipSelection} — ${option}`;
      const updatedProfile = { ...profile, [step.id]: combined };
      setProfile(updatedProfile);
      transitionToNext(updatedProfile);
      return;
    }

    // text-only step with validation
    if (step.inputMode === "text" && step.validationField) {
      setIsValidating(true);
      const result = await validateInput(step.validationField, option);
      setIsValidating(false);
      if (!result.valid) {
        setValidationError(
          result.message || "That doesn't look right. Please try again."
        );
        return;
      }
      const corrected = result.corrected || option;
      const updatedProfile = { ...profile, [step.id]: corrected };
      setProfile(updatedProfile);
      transitionToNext(updatedProfile);
      return;
    }

    // Standard chips step
    const updatedProfile = { ...profile, [step.id]: option };
    setProfile(updatedProfile);
    transitionToNext(updatedProfile);
  };

  const handleBack = () => {
    if (currentStep === 0 && subPhase === "chips") return;
    setIsTransitioning(true);
    setDirection("backward");
    setValidationError("");

    setTimeout(() => {
      if (subPhase === "text") {
        setSubPhase("chips");
        setChipSelection("");
      } else if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        const prevStep = onboardingSteps[currentStep - 1];
        if (prevStep.inputMode === "chips-then-text") {
          setSubPhase("text");
        } else {
          setSubPhase("chips");
          setChipSelection("");
        }
      }
      setIsTransitioning(false);
    }, 300);
  };

  // Completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center px-6">
        <div className="text-center animate-card-enter">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Set!
          </h2>
          <p className="text-gray-500">
            Setting up your personalized study plan...
          </p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!step) return null;

  // Determine what to show on the current card
  const iconPath = stepIcons[step.id] || stepIcons.grade;
  let cardOptions: string[] | undefined;
  let cardShowVoice = false;
  let cardVoicePlaceholder = "";
  let cardQuestion = step.question;
  let cardSubtitle: string | undefined;

  if (step.inputMode === "chips") {
    cardOptions = step.options;
  } else if (step.inputMode === "text") {
    cardShowVoice = true;
    cardVoicePlaceholder = step.textPlaceholder ?? "Tap the mic and speak...";
  } else if (step.inputMode === "chips-then-text") {
    if (subPhase === "chips") {
      cardOptions = step.options;
    } else {
      cardShowVoice = true;
      cardQuestion = step.followUpPrompt ?? "Please provide more details.";
      cardSubtitle = `Selected: ${chipSelection}`;
      cardVoicePlaceholder =
        step.followUpPlaceholder ?? "Tap the mic and speak...";
    }
  }

  const canGoBack = currentStep > 0 || subPhase === "text";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={!canGoBack || isTransitioning}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all disabled:opacity-0 disabled:cursor-default"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1 mx-4">
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2">
              {onboardingSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < currentStep
                      ? "w-6 bg-violet-500"
                      : i === currentStep
                        ? "w-8 bg-gradient-to-r from-violet-500 to-indigo-500"
                        : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-xs font-medium text-gray-400 w-10 text-right">
            {progress}%
          </span>
        </div>
      </header>

      {/* Card Area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-8">
        <div
          className={`w-full transition-all duration-300 ${
            isTransitioning
              ? direction === "forward"
                ? "opacity-0 translate-x-8"
                : "opacity-0 -translate-x-8"
              : "opacity-100 translate-x-0"
          }`}
        >
          <GuidedCard
            stepNumber={currentStep + 1}
            totalSteps={onboardingSteps.length}
            question={cardQuestion}
            subtitle={cardSubtitle}
            icon={iconPath}
            options={cardOptions}
            showVoiceInput={cardShowVoice}
            voicePlaceholder={cardVoicePlaceholder}
            onSelect={handleSelect}
            disabled={isTransitioning || isValidating}
            selectedValue={profile[step.id]}
          />

          {/* Validation error */}
          {validationError && (
            <div className="max-w-lg mx-auto mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-center animate-fade-in">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          {/* Validating spinner */}
          {isValidating && (
            <div className="flex items-center justify-center mt-4 gap-2 animate-fade-in">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600" />
              <span className="text-sm text-gray-500">Validating...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
