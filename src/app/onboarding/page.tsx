"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "@/types/onboarding";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import ProgressBar from "@/components/ProgressBar";

const PROFILE_FIELDS = [
  "name",
  "age",
  "learningGoals",
  "currentSkillLevel",
  "preferredLearningStyle",
  "interests",
  "priorExperience",
  "availableTime",
  "preferredLanguage",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const estimateProgress = useCallback(
    (msgs: ChatMessage[]) => {
      const conversationText = msgs
        .map((m) => m.content.toLowerCase())
        .join(" ");

      let fieldsCollected = 0;
      const checks: Record<string, () => boolean> = {
        name: () =>
          msgs.some(
            (m) =>
              m.role === "user" &&
              msgs.indexOf(m) <= 2 &&
              m.content.trim().split(/\s+/).length <= 4
          ),
        age: () =>
          /\b(\d{1,2}\s*(years?|yrs?|y\/o)|age|old|teen|adult|student|professional|kid|child)\b/.test(
            conversationText
          ),
        learningGoals: () =>
          /\b(learn|goal|want to|interested in|improve|master|become|study|understand)\b/.test(
            conversationText
          ),
        currentSkillLevel: () =>
          /\b(beginner|intermediate|advanced|novice|expert|basic|some experience|no experience|new to)\b/.test(
            conversationText
          ),
        preferredLearningStyle: () =>
          /\b(video|reading|hands[- ]on|interactive|project|tutorial|course|practice|exercise|visual|audio)\b/.test(
            conversationText
          ),
        interests: () =>
          /\b(interested|passionate|love|enjoy|fascinate|curious|hobby|like)\b/.test(
            conversationText
          ),
        priorExperience: () =>
          /\b(experience|worked|built|background|done|tried|used|familiar|know)\b/.test(
            conversationText
          ),
        availableTime: () =>
          /\b(\d+\s*(hour|hr|min|day|week)|daily|weekly|spare time|free time|couple|few)\b/.test(
            conversationText
          ),
        preferredLanguage: () =>
          /\b(english|spanish|hindi|french|german|chinese|japanese|korean|portuguese|arabic|language)\b/.test(
            conversationText
          ),
      };

      for (const field of PROFILE_FIELDS) {
        if (checks[field]?.()) {
          fieldsCollected++;
        }
      }

      return Math.min(
        (fieldsCollected / PROFILE_FIELDS.length) * 100,
        isComplete ? 100 : 95
      );
    },
    [isComplete]
  );

  const sendMessage = async (
    content: string,
    currentMessages: ChatMessage[]
  ) => {
    const apiMessages = currentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (content) {
      apiMessages.push({ role: "user" as const, content });
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    return response.json();
  };

  // Initial greeting
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      setIsLoading(true);
      try {
        const data = await sendMessage("", []);
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages([assistantMessage]);
      } catch {
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content:
            "Hi there! Welcome to our learning platform. I'm here to help set up your personalized learning experience. What's your name?",
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const data = await sendMessage(content, messages);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      const allMessages = [...updatedMessages, assistantMessage];
      setMessages(allMessages);

      const newProgress = estimateProgress(allMessages);
      setProgress(newProgress);

      if (data.isComplete) {
        setIsComplete(true);
        setProgress(100);

        // Extract profile and navigate after a short delay
        setTimeout(() => extractAndNavigate(allMessages), 2000);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content:
          "I'm sorry, I had a hiccup there. Could you say that again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractAndNavigate = async (msgs: ChatMessage[]) => {
    try {
      const apiMessages = msgs.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/extract-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(
          "learnerProfile",
          JSON.stringify(data.profile)
        );
      }
    } catch (error) {
      console.error("Profile extraction error:", error);
    }

    router.push("/profile");
  };

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
              Learning Profile Setup
            </h1>
            <p className="text-xs text-gray-500">
              Let&apos;s personalize your experience
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
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading || isComplete}
        placeholder={
          isComplete
            ? "Onboarding complete! Redirecting..."
            : "Type your message..."
        }
      />
    </div>
  );
}
