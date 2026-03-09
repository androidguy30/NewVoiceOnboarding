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

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<SATProfile>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Initial greeting
  useEffect(() => {
    if (started) return;
    setStarted(true);

    const init = async () => {
      await addAssistantMessage(WELCOME_MESSAGE);
      // Ask the first question after a short pause
      await addAssistantMessage(onboardingSteps[0].question);
    };
    init();
  }, [started, addAssistantMessage]);

  const progress = Math.round(
    (currentStep / onboardingSteps.length) * 100
  );

  const handleSelect = async (option: string) => {
    const step = onboardingSteps[currentStep];

    // Add user's selection as a chat bubble
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role: "user",
        content: option,
        timestamp: new Date(),
      },
    ]);

    // Save to profile
    const updatedProfile = { ...profile, [step.id]: option };
    setProfile(updatedProfile);

    // Show assistant acknowledgment
    await addAssistantMessage(step.responseTemplate(option));

    const nextStep = currentStep + 1;

    if (nextStep < onboardingSteps.length) {
      // Ask next question
      setCurrentStep(nextStep);
      await addAssistantMessage(onboardingSteps[nextStep].question);
    } else {
      // Onboarding complete
      setCurrentStep(nextStep);
      setIsComplete(true);
      const finalProfile = updatedProfile as SATProfile;
      await addAssistantMessage(COMPLETION_MESSAGE(finalProfile));

      // Save and navigate
      localStorage.setItem("satProfile", JSON.stringify(finalProfile));
      setTimeout(() => router.push("/profile"), 2500);
    }
  };

  const showChips =
    !isComplete &&
    !isTyping &&
    currentStep < onboardingSteps.length &&
    messages.length >= 2;

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

      {/* Suggestion Chips */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto py-4">
          {showChips ? (
            <SuggestionChips
              options={onboardingSteps[currentStep].options}
              onSelect={handleSelect}
              disabled={isTyping}
            />
          ) : isComplete ? (
            <p className="text-center text-sm text-gray-400 py-3">
              Setting up your study plan...
            </p>
          ) : (
            <p className="text-center text-sm text-gray-400 py-3">
              Waiting...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
