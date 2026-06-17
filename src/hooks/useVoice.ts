"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type VoiceState =
  | "idle"        // Not doing anything
  | "requesting"  // Asking for mic permission
  | "listening"   // Actively capturing speech
  | "processing"  // Final result coming in
  | "done"        // Got a result
  | "error";      // Something went wrong

export type VoiceError =
  | "unsupported"     // Browser has no SpeechRecognition
  | "not-allowed"     // User denied microphone
  | "no-speech"       // User said nothing
  | "network"         // No internet for cloud engine
  | "aborted"         // Recognition was aborted
  | "unknown";        // Catch-all

export interface UseVoiceOptions {
  /** BCP 47 language tag. Defaults to 'hi-IN' (Hindi) for Kisan Diary. */
  lang?: string;
  /** Return partial results as you speak. Default: true. */
  interimResults?: boolean;
  /** Keep listening beyond the first phrase. Default: false. */
  continuous?: boolean;
  /** Max speech-to-text alternatives. Default: 1. */
  maxAlternatives?: number;
  /** Called every time a new transcript chunk arrives. */
  onTranscript?: (text: string, isFinal: boolean) => void;
  /** Called when recognition ends with a final result. */
  onResult?: (text: string) => void;
  /** Called on any error. */
  onError?: (error: VoiceError, detail?: string) => void;
  /** Whether to play a beep sound on start and stop. Default: true. */
  enableBeep?: boolean;
}

export interface UseVoiceReturn {
  state: VoiceState;
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  error: VoiceError | null;
  errorMessage: string;
  confidence: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
}

// ─── Error messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<VoiceError, string> = {
  unsupported: "आपका ब्राउज़र वॉयस को सपोर्ट नहीं करता। Chrome या Edge उपयोग करें।",
  "not-allowed": "माइक्रोफोन की अनुमति दें। ब्राउज़र सेटिंग में जाकर अनुमति दें।",
  "no-speech": "कोई आवाज़ नहीं आई। दोबारा कोशिश करें।",
  network: "नेटवर्क एरर। इंटरनेट कनेक्शन जांचें।",
  aborted: "आवाज़ पहचान रद्द हो गई।",
  unknown: "कुछ गलत हो गया। दोबारा कोशिश करें।",
};

// ─── Browser support check ────────────────────────────────────────────────────
function getSpeechRecognitionClass(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  if (w.SpeechRecognition) return w.SpeechRecognition;
  if (w.webkitSpeechRecognition) return w.webkitSpeechRecognition;
  return null;
}

// ─── Audio Feedback ───────────────────────────────────────────────────────────
function playBeep(frequency: number = 440, duration: number = 0.1) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Lower volume
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    lang = "hi-IN",
    interimResults = true,
    continuous = false,
    maxAlternatives = 1,
    onTranscript,
    onResult,
    onError,
    enableBeep = true,
  } = options;

  const RecognitionClass = getSpeechRecognitionClass();
  const isSupported = RecognitionClass !== null;

  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [error, setError] = useState<VoiceError | null>(null);
  const [confidence, setConfidence] = useState(0);

  // Use refs so event handlers always have fresh values
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const stateRef = useRef<VoiceState>("idle");

  const updateState = useCallback((s: VoiceState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  // ── Build a fresh recognition instance ────────────────────────────────────
  const buildRecognition = useCallback((): SpeechRecognition | null => {
    if (!RecognitionClass) return null;

    const r = new RecognitionClass();
    r.lang = lang;
    r.interimResults = interimResults;
    r.continuous = continuous;
    r.maxAlternatives = maxAlternatives;

    r.onstart = () => {
      updateState("listening");
    };

    r.onspeechstart = () => {
      updateState("listening");
    };

    r.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalText += text;
          setConfidence(result[0].confidence ?? 0);
          onTranscript?.(text, true);
        } else {
          interimText += text;
          onTranscript?.(text, false);
        }
      }

      if (interimText) {
        transcriptRef.current = interimText;
        setTranscript(interimText);
        updateState("listening");
      }

      if (finalText) {
        transcriptRef.current = finalText;
        setTranscript(finalText);
        setFinalTranscript(finalText);
        updateState("processing");
        onResult?.(finalText);
        setTimeout(() => updateState("done"), 400);
      }
    };

    r.onerror = (event: SpeechRecognitionErrorEvent) => {
      let voiceError: VoiceError;
      switch (event.error) {
        case "not-allowed":
        case "service-not-allowed":
          voiceError = "not-allowed";
          break;
        case "no-speech":
          voiceError = "no-speech";
          break;
        case "network":
          voiceError = "network";
          break;
        case "aborted":
          // Treat as non-error if we already have a transcript
          if (transcriptRef.current) {
            updateState("done");
            return;
          }
          voiceError = "aborted";
          break;
        default:
          voiceError = "unknown";
      }

      setError(voiceError);
      updateState("error");
      onError?.(voiceError, event.error);
    };

    r.onend = () => {
      const s = stateRef.current;
      if (s !== "error" && s !== "done" && s !== "processing") {
        updateState("idle");
      }
    };

    return r;
  }, [
    RecognitionClass, lang, interimResults, continuous, maxAlternatives,
    onTranscript, onResult, onError, updateState,
  ]);

  // ── Start ─────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    if (!isSupported) {
      setError("unsupported");
      updateState("error");
      return;
    }

    // Tear down any existing session
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }

    setError(null);
    setTranscript("");
    transcriptRef.current = "";
    updateState("requesting");

    if (enableBeep) playBeep(600, 0.15); // Higher pitch for start

    const r = buildRecognition();
    if (!r) return;
    recognitionRef.current = r;

    try {
      r.start();
    } catch {
      setError("unknown");
      updateState("error");
    }
  }, [isSupported, buildRecognition, updateState]);

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    try { 
      if (recognitionRef.current) {
        recognitionRef.current.stop(); 
        if (enableBeep) playBeep(400, 0.15); // Lower pitch for stop
      }
    } catch { /* noop */ }
  }, [enableBeep]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    try { recognitionRef.current?.abort(); } catch { /* noop */ }
    recognitionRef.current = null;
    transcriptRef.current = "";
    setTranscript("");
    setFinalTranscript("");
    setError(null);
    setConfidence(0);
    updateState("idle");
  }, [updateState]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    const s = stateRef.current;
    if (s === "listening" || s === "requesting") {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, []);

  return {
    state,
    isSupported,
    isListening: state === "listening",
    transcript,
    finalTranscript,
    error,
    errorMessage: error ? ERROR_MESSAGES[error] : "",
    confidence,
    start,
    stop,
    reset,
    toggle,
  };
}
