"use client";

import React, { useEffect, useRef, useState } from "react";
import { useVoice, UseVoiceOptions } from "@/hooks/useVoice";

// ─── Audio visualizer bars ────────────────────────────────────────────────────
function AudioBars({ active }: { active: boolean }) {
  const bars = [3, 5, 8, 12, 16, 12, 8, 5, 3];
  return (
    <div className="vb-bars" aria-hidden>
      {bars.map((baseH, i) => (
        <div
          key={i}
          className="vb-bar"
          style={{
            animationDelay: `${i * 80}ms`,
            height: active ? `${baseH + Math.random() * 4}px` : "3px",
          }}
          data-active={active}
        />
      ))}
    </div>
  );
}

// ─── Ripple rings ─────────────────────────────────────────────────────────────
function RippleRings({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="vb-ripples" aria-hidden>
      <div className="vb-ring vb-ring-1" />
      <div className="vb-ring vb-ring-2" />
      <div className="vb-ring vb-ring-3" />
    </div>
  );
}

// ─── Confidence pill ──────────────────────────────────────────────────────────
function ConfidencePill({ confidence }: { confidence: number }) {
  if (confidence === 0) return null;
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? "#4ade80" : pct >= 55 ? "#facc15" : "#f87171";
  return (
    <div className="vb-confidence" style={{ borderColor: color + "44", color }}>
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
        <circle cx="4" cy="4" r="3.5" fill={color} />
      </svg>
      {pct}% accuracy
    </div>
  );
}

// ─── State icon ───────────────────────────────────────────────────────────────
function StateIcon({ state }: { state: string }) {
  if (state === "listening") {
    return (
      // Animated waveform
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="2" y="10" width="3" height="8" rx="1.5" fill="white" className="vb-wave-bar vb-wb-1" />
        <rect x="7" y="6" width="3" height="16" rx="1.5" fill="white" className="vb-wave-bar vb-wb-2" />
        <rect x="12" y="3" width="3" height="22" rx="1.5" fill="white" className="vb-wave-bar vb-wb-3" />
        <rect x="17" y="6" width="3" height="16" rx="1.5" fill="white" className="vb-wave-bar vb-wb-2" />
        <rect x="22" y="10" width="3" height="8" rx="1.5" fill="white" className="vb-wave-bar vb-wb-1" />
      </svg>
    );
  }
  if (state === "processing") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className="vb-spin">
        <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="2.5" strokeDasharray="34 34" strokeLinecap="round" />
      </svg>
    );
  }
  if (state === "done") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M6 14l6 6 10-11" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="vb-checkmark" />
      </svg>
    );
  }
  if (state === "error") {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 8v7M14 19v1" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    );
  }
  // Idle — microphone icon
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Start voice input">
      <rect x="10" y="3" width="8" height="14" rx="4" fill="white" />
      <path d="M6 14c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="22" x2="14" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="26" x2="18" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Unsupported fallback banner ───────────────────────────────────────────────
function UnsupportedBanner() {
  return (
    <div className="vb-unsupported" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2" />
        <path d="M12 8v5M12 16v1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <div className="vb-unsupported-title">Voice Input Not Supported</div>
        <div className="vb-unsupported-sub">
          Chrome या Edge ब्राउज़र में उपयोग करें। Firefox में यह सुविधा उपलब्ध नहीं है।
        </div>
      </div>
    </div>
  );
}

// ─── Main Props ───────────────────────────────────────────────────────────────
export interface VoiceInputProps extends UseVoiceOptions {
  /** Controlled value. Pass '' to clear. */
  value?: string;
  /** Called when transcript changes */
  onChange?: (text: string) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** If true, shows the transcript in a text area below */
  showTextArea?: boolean;
  /** Extra CSS class on the root wrapper */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Color theme */
  theme?: "green" | "blue" | "purple" | "orange" | "red";
  /** Show language badge */
  showLang?: boolean;
  /** Visual variant: default (big block) or inline (standard input with mic inside) */
  variant?: "default" | "inline";
}

// ─── Theme map ────────────────────────────────────────────────────────────────
const THEME_COLORS = {
  green:  { primary: "#16a34a", glow: "rgba(22,163,74,0.45)",  ring: "rgba(22,163,74,0.25)",  gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)" },
  blue:   { primary: "#2563eb", glow: "rgba(37,99,235,0.45)",  ring: "rgba(37,99,235,0.25)",  gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%)" },
  purple: { primary: "#7c3aed", glow: "rgba(124,58,237,0.45)", ring: "rgba(124,58,237,0.25)", gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)" },
  orange: { primary: "#ea580c", glow: "rgba(234,88,12,0.45)",  ring: "rgba(234,88,12,0.25)",  gradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 60%, #9a3412 100%)" },
  red:    { primary: "#dc2626", glow: "rgba(220,38,38,0.45)",  ring: "rgba(220,38,38,0.25)",  gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 60%, #991b1b 100%)" },
};

const SIZE_MAP = {
  sm: { btn: 48, icon: 20, fontSize: 12 },
  md: { btn: 64, icon: 28, fontSize: 14 },
  lg: { btn: 80, icon: 36, fontSize: 16 },
};

// ─── VoiceInput Component ─────────────────────────────────────────────────────
export default function VoiceInput({
  value,
  onChange,
  placeholder = "यहाँ बोलें या टाइप करें...",
  showTextArea = true,
  className = "",
  disabled = false,
  size = "md",
  theme = "green",
  showLang = true,
  lang = "hi-IN",
  ...voiceOptions
}: VoiceInputProps) {
  const colors = THEME_COLORS[theme];
  const btnSize = SIZE_MAP[size].btn;

  const [localText, setLocalText] = useState(value ?? "");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const prevTranscript = useRef("");

  const voice = useVoice({
    lang,
    interimResults: true,
    continuous: false,
    ...voiceOptions,
    onResult: (text) => {
      const newText = localText
        ? `${localText.trimEnd()} ${text}`
        : text;
      setLocalText(newText);
      onChange?.(newText);
      prevTranscript.current = text;
      voiceOptions.onResult?.(text);
    },
    onError: voiceOptions.onError,
  });

  // Sync controlled value
  useEffect(() => {
    if (value !== undefined) setLocalText(value);
  }, [value]);

  // Auto-grow textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [localText, voice.transcript]);

  const displayText = voice.isListening ? voice.transcript : localText;
  const isActive = voice.state === "listening" || voice.state === "requesting";

  const stateLabel: Record<string, string> = {
    idle:       "बोलने के लिए दबाएं",
    requesting: "माइक्रोफोन कनेक्ट हो रहा है…",
    listening:  "सुन रहा हूँ…",
    processing: "समझ रहा हूँ…",
    done:       "समझ लिया ✓",
    error:      "दोबारा कोशिश करें",
  };

  const { variant = "default" } = voiceOptions;

  if (!voice.isSupported) {
    if (variant === "inline") {
      return (
        <div style={{ position: "relative" }}>
          <input
            className="h-12 w-full rounded-xl bg-gray-50 border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder={placeholder}
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              onChange?.(e.target.value);
            }}
            disabled={disabled}
          />
        </div>
      );
    }
    return (
      <div className={`vb-root ${className}`}>
        <UnsupportedBanner />
        {showTextArea && (
          <textarea
            ref={textAreaRef}
            className="vb-textarea"
            placeholder={placeholder}
            value={localText}
            onChange={(e) => {
              setLocalText(e.target.value);
              onChange?.(e.target.value);
            }}
            rows={3}
          />
        )}
        <VoiceInputStyles colors={colors} />
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`relative ${className}`}>
        <input
          className={`h-12 w-full rounded-xl border pl-4 pr-12 text-sm transition-all focus:outline-none focus:ring-2 ${
            isActive 
              ? `bg-white border-${colors.primary} shadow-sm ring-2 ring-${colors.primary}/20` 
              : "bg-gray-50 border-gray-200 focus:bg-white"
          }`}
          style={{
            borderColor: isActive ? colors.primary : undefined,
            boxShadow: isActive ? `0 0 0 2px ${colors.primary}33` : undefined,
          }}
          placeholder={isActive ? "सुन रहा हूँ..." : placeholder}
          value={displayText}
          onChange={(e) => {
            setLocalText(e.target.value);
            onChange?.(e.target.value);
          }}
          disabled={disabled}
        />
        
        {/* Inline Mic Button */}
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            voice.toggle();
          }}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isActive ? colors.primary : "transparent",
            color: isActive ? "white" : "#64748b",
          }}
        >
          {isActive ? (
             <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>
        {voice.state === "error" && voice.errorMessage && (
          <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{voice.errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`vb-root ${className}`} data-state={voice.state}>

      {/* ── Text area ─────────────────────────────────────────────────── */}
      {showTextArea && (
        <div className="vb-text-wrap">
          <textarea
            ref={textAreaRef}
            className={`vb-textarea ${isActive ? "vb-textarea--active" : ""}`}
            placeholder={placeholder}
            value={displayText}
            onChange={(e) => {
              setLocalText(e.target.value);
              onChange?.(e.target.value);
            }}
            disabled={disabled}
            rows={3}
            style={{
              borderColor: isActive ? colors.primary + "88" : undefined,
              boxShadow: isActive ? `0 0 0 3px ${colors.ring}, 0 0 20px ${colors.glow}` : undefined,
            }}
          />
          {/* Live transcript overlay label */}
          {isActive && voice.transcript && (
            <div className="vb-live-label">
              <span className="vb-live-dot" style={{ background: colors.primary }} />
              Live
            </div>
          )}
        </div>
      )}

      {/* ── Controls row ──────────────────────────────────────────────── */}
      <div className="vb-controls">

        {/* Microphone button */}
        <div className="vb-btn-wrap">
          <RippleRings active={isActive} />

          <button
            type="button"
            className={`vb-btn vb-btn--${voice.state}`}
            onClick={() => {
              if (disabled) return;
              voice.toggle();
            }}
            disabled={disabled}
            aria-label={isActive ? "रोकें" : "बोलना शुरू करें"}
            aria-pressed={isActive}
            style={{
              width: btnSize,
              height: btnSize,
              background:
                voice.state === "error"
                  ? "linear-gradient(135deg,#dc2626,#991b1b)"
                  : voice.state === "done"
                  ? "linear-gradient(135deg,#16a34a,#15803d)"
                  : colors.gradient,
              boxShadow: isActive
                ? `0 0 0 0 transparent, 0 8px 32px ${colors.glow}`
                : `0 4px 16px ${colors.glow}`,
            }}
          >
            <StateIcon state={voice.state} />
          </button>
        </div>

        {/* State label + bars + meta */}
        <div className="vb-meta">
          <div className="vb-state-label" style={{ color: isActive ? colors.primary : undefined }}>
            {stateLabel[voice.state] ?? ""}
          </div>

          <AudioBars active={isActive} />

          <div className="vb-pills">
            {showLang && (
              <div className="vb-lang-pill">{lang}</div>
            )}
            <ConfidencePill confidence={voice.confidence} />
          </div>
        </div>

        {/* Clear button (only when there is text) */}
        {localText && !isActive && (
          <button
            type="button"
            className="vb-clear"
            onClick={() => {
              setLocalText("");
              onChange?.("");
              voice.reset();
            }}
            aria-label="Clear text"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* ── Error message ─────────────────────────────────────────────── */}
      {voice.state === "error" && voice.errorMessage && (
        <div className="vb-error-msg" role="alert">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <circle cx="7.5" cy="7.5" r="6.5" stroke="#f87171" strokeWidth="1.5" />
            <path d="M7.5 4.5v4M7.5 10v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {voice.errorMessage}
        </div>
      )}

      {/* ── Styles ─────────────────────────────────────────────────────── */}
      <VoiceInputStyles colors={colors} />
    </div>
  );
}

// ─── Injected CSS ─────────────────────────────────────────────────────────────
function VoiceInputStyles({ colors }: { colors: typeof THEME_COLORS["green"] }) {
  return (
    <style>{`
      /* ── Root ────────────────────────────────── */
      .vb-root {
        display: flex;
        flex-direction: column;
        gap: 14px;
        width: 100%;
        font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
      }

      /* ── Text wrap ───────────────────────────── */
      .vb-text-wrap { position: relative; }

      /* ── Textarea ────────────────────────────── */
      .vb-textarea {
        width: 100%;
        min-height: 90px;
        background: rgba(255,255,255,0.035);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 14px 16px;
        color: #f1f5f9;
        font-size: 15px;
        font-family: inherit;
        line-height: 1.65;
        resize: none;
        outline: none;
        transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
        caret-color: ${colors.primary};
      }
      .vb-textarea::placeholder { color: rgba(255,255,255,0.22); }
      .vb-textarea:focus {
        border-color: ${colors.primary}88;
        box-shadow: 0 0 0 3px ${colors.ring};
        background: rgba(255,255,255,0.055);
      }
      .vb-textarea--active {
        border-color: ${colors.primary}88 !important;
      }

      /* ── Live badge ──────────────────────────── */
      .vb-live-label {
        position: absolute;
        top: 10px; right: 12px;
        display: flex; align-items: center; gap: 5px;
        font-size: 10px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: ${colors.primary};
        background: ${colors.primary}18;
        padding: 3px 8px; border-radius: 99px;
        border: 1px solid ${colors.primary}44;
      }
      .vb-live-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        animation: vbPulse 1s ease-in-out infinite;
      }

      /* ── Controls row ────────────────────────── */
      .vb-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      /* ── Mic button wrapper ───────────────────── */
      .vb-btn-wrap {
        position: relative;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }

      /* ── Mic button ──────────────────────────── */
      .vb-btn {
        position: relative; z-index: 2;
        border: none; cursor: pointer;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.18s cubic-bezier(.34,1.56,.64,1),
                    box-shadow 0.25s ease,
                    opacity 0.2s;
        outline: none;
        will-change: transform;
      }
      .vb-btn:hover:not(:disabled) { transform: scale(1.08); }
      .vb-btn:active:not(:disabled) { transform: scale(0.95); }
      .vb-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .vb-btn--listening {
        animation: vbBreath 1.8s ease-in-out infinite;
      }

      /* ── Ripple rings ────────────────────────── */
      .vb-ripples {
        position: absolute; inset: -20px; z-index: 1;
        pointer-events: none;
      }
      .vb-ring {
        position: absolute; inset: 0;
        border-radius: 50%;
        border: 2px solid ${colors.primary};
        opacity: 0;
        animation: vbRipple 2.4s cubic-bezier(0,0,0.2,1) infinite;
      }
      .vb-ring-2 { animation-delay: 0.8s; }
      .vb-ring-3 { animation-delay: 1.6s; }

      /* ── Audio bars ──────────────────────────── */
      .vb-bars {
        display: flex;
        align-items: center;
        gap: 3px;
        height: 24px;
      }
      .vb-bar {
        width: 3px;
        border-radius: 2px;
        background: ${colors.primary};
        transition: height 0.15s ease;
      }
      [data-active="true"].vb-bar {
        animation: vbBar 0.6s ease-in-out infinite alternate;
      }

      /* ── Meta info ───────────────────────────── */
      .vb-meta {
        flex: 1;
        display: flex; flex-direction: column; gap: 6px;
      }
      .vb-state-label {
        font-size: 12px; font-weight: 600;
        color: #64748b; letter-spacing: 0.02em;
        transition: color 0.25s;
      }

      /* ── Pills row ───────────────────────────── */
      .vb-pills { display: flex; align-items: center; gap: 6px; }
      .vb-lang-pill {
        font-size: 10px; font-weight: 700;
        color: #64748b; background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        padding: 2px 8px; border-radius: 99px;
        letter-spacing: 0.06em; text-transform: uppercase;
      }
      .vb-confidence {
        display: flex; align-items: center; gap: 4px;
        font-size: 10.5px; font-weight: 600;
        padding: 2px 8px; border-radius: 99px;
        border-width: 1px; border-style: solid;
        letter-spacing: 0.04em;
      }

      /* ── Clear button ────────────────────────── */
      .vb-clear {
        display: flex; align-items: center; gap: 5px;
        font-size: 11px; font-weight: 600;
        color: #64748b; cursor: pointer;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 99px; padding: 6px 12px;
        transition: color 0.15s, background 0.15s;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .vb-clear:hover { color: #94a3b8; background: rgba(255,255,255,0.08); }

      /* ── Error message ────────────────────────── */
      .vb-error-msg {
        display: flex; align-items: flex-start; gap: 8px;
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.2);
        border-radius: 12px; padding: 10px 14px;
        font-size: 12.5px; color: #fca5a5; line-height: 1.55;
        animation: vbSlideDown 0.3s ease-out;
      }

      /* ── Unsupported banner ───────────────────── */
      .vb-unsupported {
        display: flex; align-items: flex-start; gap: 10px;
        background: rgba(245,158,11,0.08);
        border: 1px solid rgba(245,158,11,0.2);
        border-radius: 14px; padding: 14px 16px;
      }
      .vb-unsupported-title {
        font-size: 13px; font-weight: 700; color: #fbbf24; margin-bottom: 3px;
      }
      .vb-unsupported-sub {
        font-size: 11.5px; color: #92400e; line-height: 1.5;
      }

      /* ── SVG animations ──────────────────────── */
      .vb-wave-bar {
        transform-origin: center bottom;
        animation: vbWave 0.7s ease-in-out infinite alternate;
      }
      .vb-wb-1 { animation-duration: 0.5s; }
      .vb-wb-2 { animation-duration: 0.65s; animation-delay: 0.12s; }
      .vb-wb-3 { animation-duration: 0.8s;  animation-delay: 0.25s; }
      .vb-spin { animation: spin360 1s linear infinite; }
      .vb-checkmark {
        stroke-dasharray: 30;
        stroke-dashoffset: 30;
        animation: vbCheck 0.5s ease-out forwards;
      }

      /* ── Keyframes ───────────────────────────── */
      @keyframes vbPulse {
        0%,100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.4; transform: scale(0.85); }
      }
      @keyframes vbBreath {
        0%,100% { transform: scale(1); }
        50%      { transform: scale(1.06); }
      }
      @keyframes vbRipple {
        0%   { transform: scale(0.6); opacity: 0.6; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes vbBar {
        0%   { transform: scaleY(0.4); }
        100% { transform: scaleY(1.4); }
      }
      @keyframes vbWave {
        0%   { transform: scaleY(0.5); }
        100% { transform: scaleY(1); }
      }
      @keyframes spin360 { to { transform: rotate(360deg); } }
      @keyframes vbCheck {
        to { stroke-dashoffset: 0; }
      }
      @keyframes vbSlideDown {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
