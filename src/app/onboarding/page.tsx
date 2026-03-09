"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, SATProfile } from "@/types/onboarding";
import ChatBubble from "@/components/ChatBubble";
import SuggestionChips from "@/components/SuggestionChips";
import TypingIndicator from "@/components/TypingIndicator";
import ProgressBar from "@/components/ProgressBar";
import {
  onboardingSteps,
  WELCOME_MESSAGE,
  COMPLETION_MESSAGE,
} from "@/lib/onboarding-steps";

/**
 * For "chips-then-text" steps, we go through two sub-phases:
 *  1. "chips" — show the chip options (e.g. "Within US" / "Outside US")
 *  2. "text"  — after chip selection, show a text field for details
 * The final stored value combines both: "Within US — New York, NY"
 */
type SubPhase = "chips" | "text";

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<SATProfile>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For chips-then-text steps
  const [subPhase, setSubPhase] = useState<SubPhase>("chips");
  const [chipSelection, setChipSelection] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addAssistantMessage = useCallback(
    (content: string): Promise<void> => {
      return new Promise((resolve) => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
          resolve();
        }, 800);
      });
    },
    []
  );

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "user",
        content,
        timestamp: new Date(),
      },
    ]);
  };

  // Initial greeting
  useEffect(() => {
    if (started) return;
    setStarted(true);

    const init = async () => {
      await addAssistantMessage(WELCOME_MESSAGE);
      await addAssistantMessage(onboardingSteps[0].question);
    };
    init();
  }, [started, addAssistantMessage]);

  const progress = Math.round(
    (currentStep / onboardingSteps.length) * 100
  );

  const advanceToNextStep = async (
    updatedProfile: Partial<SATProfile>,
    responseText: string
  ) => {
    await addAssistantMessage(responseText);

    const nextStep = currentStep + 1;

    if (nextStep < onboardingSteps.length) {
      setCurrentStep(nextStep);
      setSubPhase("chips");
      setChipSelection("");
      await addAssistantMessage(onboardingSteps[nextStep].question);
    } else {
      setCurrentStep(nextStep);
      setIsComplete(true);
      const finalProfile = updatedProfile as SATProfile;
      await addAssistantMessage(COMPLETION_MESSAGE(finalProfile));

      localStorage.setItem("satProfile", JSON.stringify(finalProfile));
      setTimeout(() => router.push("/profile"), 2500);
    }
  };

  const handleSelect = async (option: string) => {
    const step = onboardingSteps[currentStep];

    if (step.inputMode === "chips-then-text" && subPhase === "chips") {
      // First phase: user picked a chip (e.g. "Within US")
      addUserMessage(option);
      setChipSelection(option);
      setSubPhase("text");
      // Ask follow-up
      await addAssistantMessage(
        step.followUpPrompt ?? "Please provide more details."
      );
      return;
    }

    if (step.inputMode === "chips-then-text" && subPhase === "text") {
      // Second phase: user typed details
      addUserMessage(option);
      const combined = `${chipSelection} — ${option}`;
      const updatedProfile = { ...profile, [step.id]: combined };
      setProfile(updatedProfile);
      await advanceToNextStep(updatedProfile, step.responseTemplate(combined));
      return;
    }

    // Standard chips or text step
    addUserMessage(option);
    const updatedProfile = { ...profile, [step.id]: option };
    setProfile(updatedProfile);
    await advanceToNextStep(updatedProfile, step.responseTemplate(option));
  };

  // Determine what input to show
  const step = currentStep < onboardingSteps.length ? onboardingSteps[currentStep] : null;
  const showInput = !isComplete && !isTyping && step && messages.length >= 2;

  let chipOptions: string[] | undefined;
  let showTextInput = false;
  let textPlaceholder = "";

  if (showInput && step) {
    if (step.inputMode === "chips") {
      chipOptions = step.options;
    } else if (step.inputMode === "text") {
      showTextInput = true;
      textPlaceholder = step.textPlaceholder ?? "Type your answer...";
    } else if (step.inputMode === "chips-then-text") {
      if (subPhase === "chips") {
        chipOptions = step.options;
      } else {
        showTextInput = true;
        textPlaceholder = step.followUpPlaceholder ?? "Type here...";
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              SAT Prep Setup
            </h1>
            <p className="text-xs text-gray-500">
              Let&apos;s personalize your study plan
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <ProgressBar progress={progress} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto py-4">
          {showInput ? (
            <SuggestionChips
              options={chipOptions}
              onSelect={handleSelect}
              disabled={isTyping}
              showTextInput={showTextInput}
              textPlaceholder={textPlaceholder}
            />
          ) : isComplete ? (
            <p className="text-center text-sm text-gray-400 py-3">
              Setting up your study plan...
            </p>
          ) : (
            <p className="text-center text-sm text-gray-400 py-3">
              &nbsp;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
