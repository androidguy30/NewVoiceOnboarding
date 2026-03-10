"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  disabled: boolean;
  placeholder?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionAny = any;

/**
 * Cross-browser SpeechRecognition.
 * Supported on Chrome (desktop & Android), Safari 14.1+ (desktop & iOS), Edge.
 * Falls back to a text input on unsupported browsers.
 */
function getSpeechRecognition(): SpeechRecognitionAny {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const W = window as any;
  return W.SpeechRecognition || W.webkitSpeechRecognition || null;
}

export default function VoiceInput({
  onResult,
  disabled,
  placeholder = "Tap the mic and speak...",
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [fallbackText, setFallbackText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionAny>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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

      // On mobile, "no-speech" is common — don't treat as fatal
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.start();
  }, []);

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

  const handleFallbackSubmit = () => {
    const trimmed = fallbackText.trim();
    if (trimmed && !disabled) {
      onResult(trimmed);
      setFallbackText("");
    }
  };

  // Fallback text input for unsupported browsers
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={fallbackText}
          onChange={(e) => setFallbackText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleFallbackSubmit();
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 transition-all"
          autoFocus
        />
        <button
          onClick={handleFallbackSubmit}
          disabled={disabled || !fallbackText.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    );
  }

  const displayText = transcript || interimTranscript;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Transcript display */}
      <div className="w-full min-h-[44px] flex items-center justify-center px-4">
        {displayText ? (
          <p className="text-sm text-gray-800 text-center">
            {transcript && (
              <span className="font-medium">{transcript}</span>
            )}
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
        {/* Mic button */}
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
            /* Stop icon */
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            /* Mic icon */
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

        {/* Submit button — visible when we have a final transcript */}
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

      {/* Status label */}
      <p className="text-xs text-gray-400">
        {isListening ? "Listening... tap to stop" : "Tap the mic to speak"}
      </p>
    </div>
  );
}
