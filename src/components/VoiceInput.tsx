"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  disabled: boolean;
  placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any;

function getSpeechRecognition(): SpeechRecognitionAny {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const W = window as any;
  return W.SpeechRecognition || W.webkitSpeechRecognition || null;
}

type MicPermission = "prompt" | "granted" | "denied";

export default function VoiceInput({
  onResult,
  disabled,
  placeholder = "Tap the mic and speak...",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<MicPermission>("prompt");
  const [fallbackText, setFallbackText] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionAny>(null);
  const hasSubmittedRef = useRef(false);

  // Check support + permission on mount
  useEffect(() => {
    const supported = getSpeechRecognition() !== null;
    setIsSupported(supported);

    if (!supported) return;

    // Check mic permission (async, best-effort)
    (async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setMicPermission(result.state as MicPermission);
          result.onchange = () => {
            setMicPermission(result.state as MicPermission);
            if (result.state === "granted") setShowFallback(false);
          };
        }
      } catch {
        // permissions.query("microphone") not supported (Safari) — stay "prompt"
      }
    })();
  }, []);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      setShowFallback(false);
      return true;
    } catch (err) {
      console.error("Mic permission denied:", err);
      setMicPermission("denied");
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(async () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    // Request permission if not yet granted
    if (micPermission !== "granted") {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ok */ }
    }

    hasSubmittedRef.current = false;
    const recognition = new SpeechRecognitionClass();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(final);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setMicPermission("denied");
        setIsListening(false);
        return;
      }
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
    }
  }, [micPermission, requestMicPermission]);

  const handleSubmit = useCallback(() => {
    if (hasSubmittedRef.current) return;
    const value = transcript.trim();
    if (value && !disabled) {
      hasSubmittedRef.current = true;
      stopListening();
      onResult(value);
      setTranscript("");
    }
  }, [transcript, disabled, stopListening, onResult]);

  const handleRetryPermission = useCallback(async () => {
    const granted = await requestMicPermission();
    if (!granted) {
      setShowFallback(true);
    }
  }, [requestMicPermission]);

  const handleFallbackSubmit = () => {
    const trimmed = fallbackText.trim();
    if (trimmed && !disabled) {
      onResult(trimmed);
      setFallbackText("");
    }
  };

  // Still checking support — show nothing yet
  if (isSupported === null) {
    return <div className="h-20" />;
  }

  // Speech recognition not supported — always show text fallback
  if (!isSupported) {
    return (
      <TextFallback
        value={fallbackText}
        onChange={setFallbackText}
        onSubmit={handleFallbackSubmit}
        disabled={disabled}
        placeholder={placeholder}
      />
    );
  }

  // Permission denied — show re-request UI
  if (micPermission === "denied" && !showFallback) {
    return (
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
            />
            <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Microphone access is needed to hear your answer.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetryPermission}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
          >
            Allow Microphone
          </button>
          <button
            onClick={() => setShowFallback(true)}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            Type Instead
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          If the prompt doesn&apos;t appear, check your browser&apos;s site settings
        </p>
      </div>
    );
  }

  // Permission denied + user chose fallback
  if (showFallback) {
    return (
      <div className="animate-fade-in">
        <TextFallback
          value={fallbackText}
          onChange={setFallbackText}
          onSubmit={handleFallbackSubmit}
          disabled={disabled}
          placeholder={placeholder}
        />
        <button
          onClick={handleRetryPermission}
          className="mt-2 mx-auto block text-xs text-violet-600 hover:text-violet-700 underline"
        >
          Try microphone again
        </button>
      </div>
    );
  }

  // Normal mic UI
  const displayText = transcript || interimTranscript;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Transcript display */}
      <div className="w-full min-h-[44px] flex items-center justify-center px-4">
        {displayText ? (
          <p className="text-sm text-gray-800 text-center">
            {transcript && <span className="font-medium">{transcript}</span>}
            {interimTranscript && (
              <span className="text-gray-400 italic">{interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-400 text-center">{placeholder}</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? "bg-red-500 hover:bg-red-600 voice-pulse"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          }`}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isListening ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
              />
            </svg>
          )}
        </button>

        {transcript.trim() && !isListening && (
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-40 animate-fade-in"
            aria-label="Submit answer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {isListening ? "Listening... tap to stop" : "Tap the mic to speak"}
      </p>
    </div>
  );
}

function TextFallback({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
        autoFocus
      />
      <button
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
