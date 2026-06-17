"use client";

import { useState } from "react";
import VoiceInput from "@/components/ui/VoiceInput";
import { useVoice } from "@/hooks/useVoice";
import Link from "next/link";

// ─── Language options for the demo ────────────────────────────────────────────
const LANG_OPTIONS = [
  { code: "hi-IN",  label: "हिंदी",    flag: "🇮🇳" },
  { code: "en-US",  label: "English",  flag: "🇺🇸" },
  { code: "mr-IN",  label: "मराठी",    flag: "🟠" },
  { code: "pa-IN",  label: "ਪੰਜਾਬੀ",   flag: "🟡" },
  { code: "gu-IN",  label: "ગુજરાતી", flag: "🟢" },
  { code: "ta-IN",  label: "தமிழ்",   flag: "🔴" },
];

const THEME_OPTIONS = ["green", "blue", "purple", "orange"] as const;

// ─── History entry ────────────────────────────────────────────────────────────
interface HistoryEntry {
  id: number;
  text: string;
  lang: string;
  confidence: number;
  at: string;
}

// ─── Mini VoiceBar (for the history section) ──────────────────────────────────
function MiniVoiceBar({ lang, onResult }: { lang: string; onResult: (t: string, c: number) => void }) {
  const voice = useVoice({
    lang,
    onResult: (text) => onResult(text, voice.confidence),
  });

  return (
    <button
      type="button"
      onClick={voice.toggle}
      aria-label="Quick voice capture"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: voice.isListening ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${voice.isListening ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 99, padding: "6px 14px",
        color: voice.isListening ? "#4ade80" : "#64748b",
        fontSize: 12, fontWeight: 600, cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="4" y="1" width="4" height="7" rx="2" fill="currentColor" />
        <path d="M2 6c0 2.2 1.79 4 4 4s4-1.8 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="10" x2="6" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {voice.isListening ? "सुन रहा है…" : "Add Voice Note"}
    </button>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────
export default function VoiceDemoPage() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("hi-IN");
  const [theme, setTheme] = useState<"green" | "blue" | "purple" | "orange">("green");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [counter, setCounter] = useState(0);

  function handleResult(transcript: string) {
    // save to history
    const c = counter + 1;
    setCounter(c);
    setHistory((prev) => [
      {
        id: c,
        text: transcript,
        lang,
        confidence: 0, // pulled from the hook inside VoiceInput
        at: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ].slice(0, 10));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#071209", padding: "40px 16px" }}>

      {/* ── Background blobs ──── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,#16a34a,transparent 70%)", top: -140, right: -140, opacity: 0.12, filter: "blur(80px)", animation: "floatBlob1 14s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,#0ea5e9,transparent 70%)", bottom: -90, left: -90, opacity: 0.1, filter: "blur(80px)", animation: "floatBlob2 18s ease-in-out infinite 3s" }} />
        <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,#7c3aed,transparent 70%)", top: "40%", left: "30%", opacity: 0.07, filter: "blur(60px)", animation: "floatBlob3 12s ease-in-out infinite 6s" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

        {/* ── Header ──── */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 99, padding: "6px 18px", marginBottom: 20, fontSize: 12, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em" }}>
            🎤 VOICE INPUT — DEMO
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, color: "#f8fafc", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>
            बोलिए,<br />
            <span style={{ background: "linear-gradient(90deg,#4ade80,#34d399,#6ee7b7)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              हम समझेंगे
            </span>
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 440, margin: "0 auto" }}>
            100% Free • Works in Chrome & Edge • No API key needed<br />
            Real-time Hindi + regional language recognition
          </p>
          <Link href="/app/home" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12, color: "#4ade80", textDecoration: "none" }}>
            ← Back to App
          </Link>
        </div>

        {/* ── Controls (lang + theme) ──── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 8 }}>
              Language / भाषा
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: lang === l.code ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${lang === l.code ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 99, padding: "5px 12px",
                    fontSize: 12, fontWeight: 600,
                    color: lang === l.code ? "#4ade80" : "#64748b",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 8 }}>
              Color Theme
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {THEME_OPTIONS.map((t) => {
                const c = { green: "#16a34a", blue: "#2563eb", purple: "#7c3aed", orange: "#ea580c" }[t];
                return (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    aria-label={`Theme: ${t}`}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: c, cursor: "pointer", border: "none",
                      outline: theme === t ? `3px solid ${c}` : "3px solid transparent",
                      outlineOffset: 2, transition: "outline 0.2s, transform 0.2s",
                      transform: theme === t ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main VoiceInput card ──── */}
        <div style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: "28px 28px 24px",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569", marginBottom: 16 }}>
            🎙️ Voice Input — Main
          </div>
          <VoiceInput
            value={text}
            onChange={setText}
            lang={lang}
            theme={theme}
            size="lg"
            placeholder="यहाँ बोलें — जैसे: 'आज 2 एकड़ गेहूं की बुआई की, लागत 1500 रुपए'"
            showLang={true}
            onResult={handleResult}
          />
          {text && (
            <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#4ade80", letterSpacing: "0.08em", marginBottom: 6 }}>CAPTURED TEXT</div>
              <p style={{ fontSize: 14, color: "#d1fae5", lineHeight: 1.7, wordBreak: "break-word" }}>{text}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  onClick={() => navigator.clipboard.writeText(text)}
                  style={{ fontSize: 11, color: "#64748b", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "4px 12px", cursor: "pointer" }}
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => setText("")}
                  style={{ fontSize: 11, color: "#64748b", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "4px 12px", cursor: "pointer" }}
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── How it works ──── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {[
            { icon: "🔒", title: "100% Free", desc: "Web Speech API — no API key, no cost, ever." },
            { icon: "⚡", title: "Real-time", desc: "See words appear as you speak — no delay." },
            { icon: "🌐", title: "Multi-lingual", desc: "Hindi, Marathi, English, Punjabi & more." },
            { icon: "🛡️", title: "Secure", desc: "Audio never stored. Processed by browser engine." },
          ].map((f) => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18, padding: "18px 16px",
              transition: "border-color 0.2s, background 0.2s",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(74,222,128,0.2)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.025)";
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#d1fae5", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Session history ──── */}
        {history.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "22px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569" }}>
                📝 Session History ({history.length})
              </div>
              <button
                onClick={() => setHistory([])}
                style={{ fontSize: 11, color: "#64748b", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 99, padding: "4px 12px", cursor: "pointer" }}
              >
                Clear All
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((h) => (
                <div key={h.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  animation: "vbSlideDown 0.3s ease-out",
                }}>
                  <div style={{ fontSize: 18, marginTop: 1, flexShrink: 0 }}>🗣️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, color: "#d1fae5", lineHeight: 1.65, wordBreak: "break-word", margin: 0 }}>{h.text}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 10.5, color: "#334155" }}>{h.lang}</span>
                      <span style={{ fontSize: 10.5, color: "#334155" }}>•</span>
                      <span style={{ fontSize: 10.5, color: "#334155" }}>{h.at}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setText(h.text);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{ fontSize: 10, color: "#4ade80", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 99, padding: "4px 10px", cursor: "pointer", flexShrink: 0 }}
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Browser support note ──── */}
        <div style={{ padding: "16px 20px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 14, fontSize: 12.5, color: "#78350f", lineHeight: 1.6 }}>
          <strong style={{ color: "#d97706" }}>⚠️ Browser Support:</strong>{" "}
          Chrome 25+ ✅ · Edge 79+ ✅ · Safari 14.1+ ✅ (partial) · Firefox ❌ (requires flag)<br />
          <span style={{ color: "#92400e" }}>Firefox पर काम नहीं करता। Chrome या Edge उपयोग करें।</span>
        </div>

      </div>

      {/* ── Global demo styles ──── */}
      <style>{`
        @keyframes vbSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', 'Noto Sans Devanagari', sans-serif; }
      `}</style>
    </main>
  );
}
