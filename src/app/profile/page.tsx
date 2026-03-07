"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LearnerProfile } from "@/types/onboarding";

const profileFieldLabels: Record<keyof LearnerProfile, string> = {
  name: "Name",
  age: "Age Group",
  learningGoals: "Learning Goals",
  currentSkillLevel: "Skill Level",
  preferredLearningStyle: "Learning Style",
  interests: "Interests",
  priorExperience: "Prior Experience",
  availableTime: "Available Time",
  preferredLanguage: "Preferred Language",
};

const fieldIcons: Record<keyof LearnerProfile, string> = {
  name: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  age: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  learningGoals:
    "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  currentSkillLevel:
    "M13 10V3L4 14h7v7l9-11h-7z",
  preferredLearningStyle:
    "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  interests:
    "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  priorExperience:
    "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  availableTime:
    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  preferredLanguage:
    "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Partial<LearnerProfile> | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("learnerProfile");
    if (stored) {
      setProfile(JSON.parse(stored));
      setTimeout(() => setIsLoaded(true), 100);
    } else {
      router.push("/onboarding");
    }
  }, [router]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  const renderValue = (key: keyof LearnerProfile, value: unknown) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400 italic">Not provided</span>;
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium border border-violet-100"
            >
              {item}
            </span>
          ))}
        </div>
      );
    }
    if (!value || value === "") return <span className="text-gray-400 italic">Not provided</span>;
    return <span className="text-gray-800 font-medium">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg transition-all duration-700 ${isLoaded ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1
            className={`text-2xl font-bold text-gray-900 transition-all duration-700 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            Welcome{profile.name ? `, ${profile.name}` : ""}!
          </h1>
          <p
            className={`text-gray-500 mt-2 transition-all duration-700 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            Here&apos;s your personalized learning profile
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="divide-y divide-gray-100">
            {(Object.keys(profileFieldLabels) as (keyof LearnerProfile)[]).map(
              (key) => (
                <div
                  key={key}
                  className="flex items-start px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={fieldIcons[key]}
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {profileFieldLabels[key]}
                    </p>
                    <div className="mt-0.5 text-sm">
                      {renderValue(key, profile[key])}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className={`mt-6 flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <button
            onClick={() => router.push("/onboarding")}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Redo Onboarding
          </button>
          <button
            onClick={() => {
              alert(
                "This would navigate to the main dashboard with your personalized content!"
              );
            }}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
