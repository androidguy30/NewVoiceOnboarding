"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            SAT Prep
          </span>
        </h1>

        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Your personalized SAT study plan starts here. Answer 3 quick
          questions and we&apos;ll build a tailored prep experience just for
          you.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              label: "Chat-Based",
            },
            {
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
              label: "Quick Setup",
            },
            {
              icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              label: "Personalized",
            },
          ].map((feature, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-violet-50 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-600">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/onboarding-cards")}
          className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-lg hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          Get Started
        </button>

        <button
          onClick={() => router.push("/onboarding")}
          className="w-full mt-3 py-3 px-8 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
        >
          Chat-Based Setup
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Takes about 30 seconds — no typing required
        </p>
      </div>
    </div>
  );
}
