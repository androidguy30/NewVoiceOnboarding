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

// Module-level cache so denial persists across VoiceInput remounts
let cachedMicPermission: MicPermission | null = null;

export default function VoiceInput({
  onResult,
  disabled,
  placeholder = "Tap the mic and speak...",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [micPermission, setMicPermission] = useState<MicPermission>(
    cachedMicPermission ?? "prompt"
  );
  const [fallbackText, setFallbackText] = useState("");
  const [showSettingsHint, setShowSettingsHint] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const recognitionRef = useRef<SpeechRecognitionAny>(null);
  const hasSubmittedRef = useRef(false);

  // Sync local state to module-level cache
  useEffect(() => {
    cachedMicPermission = micPermission;
  }, [micPermission]);

  // Check support + permission on mount
  useEffect(() => {
    const supported = getSpeechRecognition() !== null;
    setIsSupported(supported);

    if (!supported) return;

    // If we already know it's denied from a previous mount, skip the query
    if (cachedMicPermission === "denied") {
      setMicPermission("denied");
      return;
    }

    // Check mic permission (async, best-effort)
    (async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          const state = result.state as MicPermission;
          setMicPermission(state);
          cachedMicPermission = state;

          result.onchange = () => {
            const newState = result.state as MicPermission;
            setMicPermission(newState);
            cachedMicPermission = newState;
            if (newState === "granted") {
              setShowSettingsHint(false);
              setRetryCount(0);
            }
          };
        }
      } catch {
        // permissions.query("microphone") not supported (Safari) — stay "prompt"
      }
    })();
  }, []);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    // First, re-check via Permissions API — the user may have changed site settings
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (result.state === "granted") {
          setMicPermission("granted");
          cachedMicPermission = "granted";
          setShowSettingsHint(false);
          setRetryCount(0);
          return true;
        }
      }
    } catch {
      // Not supported — fall through to getUserMedia
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      cachedMicPermission = "granted";
      setShowSettingsHint(false);
      setRetryCount(0);
      return true;
    } catch (err) {
      console.error("Mic permission denied:", err);
      setMicPermission("denied");
      cachedMicPermission = "denied";
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
        cachedMicPermission = "denied";
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
      // After first failed retry, show settings instructions
      setRetryCount((prev) => {
        const next = prev + 1;
        if (next >= 1) setShowSettingsHint(true);
        return next;
      });
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

  // Permission denied — show text fallback with option to re-enable mic
  if (micPermission === "denied") {
    return (
      <div className="flex flex-col gap-3 animate-fade-in">
        <TextFallback
          value={fallbackText}
          onChange={setFallbackText}
          onSubmit={handleFallbackSubmit}
          disabled={disabled}
          placeholder={placeholder}
        />
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleRetryPermission}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z"
              />
            </svg>
            Enable Microphone
          </button>
          {showSettingsHint && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-xs text-center animate-fade-in">
              <p className="text-xs text-amber-800 font-medium mb-1">
                Browser is blocking the microphone
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Tap the lock/info icon in your browser&apos;s address bar, find
                &quot;Microphone&quot;, and change it to &quot;Allow&quot;. Then
                tap &quot;Enable Microphone&quot; above.
              </p>
            </div>
          )}
        </div>
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
