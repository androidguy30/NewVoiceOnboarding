"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SATProfile } from "@/types/onboarding";

const profileFields: {
  key: keyof SATProfile;
  label: string;
  icon: string;
}[] = [
  {
    key: "grade",
    label: "Grade",
    icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0121 12.75c0 2.278-.658 4.408-1.84 6.25L12 14zm0 0l-6.16-3.422A12.083 12.083 0 003 12.75c0 2.278.658 4.408 1.84 6.25L12 14z",
  },
  {
    key: "location",
    label: "Location",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "school",
    label: "School",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    key: "examDate",
    label: "SAT Exam Timeline",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    key: "targetScoreRW",
    label: "Target Score — Reading & Writing",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    key: "targetScoreMath",
    label: "Target Score — Math",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    key: "studyHoursPerWeek",
    label: "Study Hours / Week",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SATProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("satProfile");
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

  const totalTarget =
    (parseInt(profile.targetScoreRW.split("–")[1] || "0") || 0) +
    (parseInt(profile.targetScoreMath.split("–")[1] || "0") || 0);

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
            Your SAT Study Plan is Ready!
          </h1>
          <p
            className={`text-gray-500 mt-2 transition-all duration-700 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            Target composite score: up to {totalTarget}
          </p>
        </div>
      </header>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <div className="divide-y divide-gray-100">
            {profileFields.map((field) => (
              <div
                key={field.key}
                className="flex items-start px-6 py-5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={field.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {profile[field.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          className={`mt-6 flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <button
            onClick={() => {
              localStorage.removeItem("satProfile");
              router.push("/onboarding");
            }}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Redo Onboarding
          </button>
          <button
            onClick={() => {
              alert(
                "This would navigate to your personalized SAT study dashboard!"
              );
            }}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
          >
            Start Studying
          </button>
        </div>
      </div>
    </div>
  );
}
