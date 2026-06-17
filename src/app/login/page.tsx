"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, Wheat, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

// ─── Client-side phone validation (mirrors server-side) ───────────────────────
function validatePhone(phone: string): string | null {
  if (phone.length === 0) return null; // no error when empty
  if (!/^\d+$/.test(phone)) return "केवल अंक दर्ज करें";
  if (phone.length < 10) return null; // still typing
  if (!/^[6-9]/.test(phone)) return "नंबर 6, 7, 8 या 9 से शुरू होना चाहिए";

  const digits = phone.split("").map(Number);

  // All same digit
  if (new Set(digits).size === 1) return "यह नंबर अमान्य है";

  // Any digit ≥7 times
  for (let d = 0; d <= 9; d++) {
    if (digits.filter((x) => x === d).length >= 7) return "यह नंबर अमान्य है";
  }

  // 5+ consecutive equal digits
  if (/(\d)\1{4,}/.test(phone)) return "यह नंबर अमान्य है";

  // Sequential ascending/descending (7+ pairs)
  let asc = 0, desc = 0;
  for (let i = 0; i < 9; i++) {
    const diff = digits[i + 1] - digits[i];
    asc  = (diff === 1 || diff === -9) ? asc  + 1 : 0;
    desc = (diff === -1 || diff === 9) ? desc + 1 : 0;
    if (asc >= 7 || desc >= 7) return "यह नंबर अमान्य है";
  }

  // Mirrored halves e.g. 1234512345
  if (phone.slice(0, 5) === phone.slice(5)) return "यह नंबर अमान्य है";

  // Repeating 2-digit block e.g. 9090909090
  if (/^(\d{2})\1{4}$/.test(phone)) return "यह नंबर अमान्य है";

  // Hard block-list
  const blocked = new Set([
    "9876543210","8765432109","7654321098","6543210987",
    "9012345678","8901234567","7890123456","6789012345",
    "9999900000","9000000000","8000000000","7000000000","6000000000",
  ]);
  if (blocked.has(phone)) return "यह नंबर अमान्य है";

  return null; // ✓ valid
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useApp();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.isAdmin ? "/admin/dashboard" : "/app/home");
    }
  }, [isLoading, router, user]);

  const handlePhoneChange = useCallback((raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
    setError("");
    if (cleaned.length === 10) {
      setPhoneError(validatePhone(cleaned));
    } else {
      setPhoneError(null);
    }
  }, []);

  const handlePinChange = useCallback((raw: string) => {
    setPin(raw.replace(/\D/g, "").slice(0, 6));
    setError("");
  }, []);

  const phoneValid = phone.length === 10 && phoneError === null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const err = validatePhone(phone);
    if (err || phone.length !== 10) {
      setPhoneError(err ?? "10 अंकों का मोबाइल नंबर दर्ज करें");
      return;
    }
    if (pin.length < 4) {
      setError("PIN कम से कम 4 अंकों का होना चाहिए।");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pin, name: name.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "लॉगिन विफल रहा।");
      }

      login(data.data.token, data.data.user);
      router.push(data.data.user.isAdmin ? "/admin/dashboard" : "/app/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "लॉगिन विफल रहा।");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#071209", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#4ade80", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <main className="lp-bg">
      <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />

      <div className="lp-center">
        <div className="lp-card auth-scale-in">

          {/* ── Brand ───────────────────────────────── */}
          <div className="lp-brand">
            <div className="lp-logo-ring">
              <img src="/logo.jpg" alt="Kisan Diary" className="lp-logo" />
            </div>
            <div>
              <div className="lp-brand-hi">किसान डायरी</div>
              <div className="lp-brand-en">Kisan Diary</div>
            </div>
          </div>

          {/* ── Greeting ────────────────────────────── */}
          <div className="lp-greet">
            <h1 className="lp-title flex items-center gap-2.5">
              नमस्ते
              <Wheat className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
            </h1>
            <p className="lp-sub">मोबाइल नंबर और PIN से जारी रखें</p>
          </div>

          {/* ── Form ────────────────────────────────── */}
          <form onSubmit={handleSubmit} noValidate className="lp-form">

            {/* Mobile */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-phone">मोबाइल नंबर</label>
              <div className={`lp-input-row ${phoneError ? "lp-input-row--err" : phoneValid ? "lp-input-row--ok" : ""}`}>
                <Phone className="lp-icon" aria-hidden />
                <span className="lp-prefix">+91</span>
                <input
                  id="lp-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="lp-input lp-input--phone"
                  disabled={busy}
                  maxLength={10}
                  aria-describedby={phoneError ? "lp-phone-err" : undefined}
                />
                {phoneValid && (
                  <CheckCircle2 className="lp-ok-icon" aria-label="Valid number" />
                )}
              </div>
              {phoneError && (
                <p id="lp-phone-err" className="lp-field-err auth-slide-down">
                  <AlertCircle className="lp-field-err-icon" aria-hidden />
                  {phoneError}
                </p>
              )}
            </div>

            {/* Name */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-name">आपका नाम (वैकल्पिक)</label>
              <div className="lp-input-row">
                <input
                  id="lp-name"
                  type="text"
                  autoComplete="name"
                  placeholder="उदा. रामलाल"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="lp-input"
                  style={{ paddingLeft: '20px' }}
                  disabled={busy}
                />
              </div>
            </div>

            {/* PIN */}
            <div className="lp-field">
              <label className="lp-label" htmlFor="lp-pin">PIN</label>
              <div className="lp-input-row">
                <Lock className="lp-icon" aria-hidden />
                <input
                  id="lp-pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  placeholder="• • • • • •"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="lp-input lp-input--pin"
                  disabled={busy}
                  maxLength={6}
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPin((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPin ? "PIN छुपाएं" : "PIN दिखाएं"}
                >
                  {showPin ? <EyeOff className="lp-eye-icon" /> : <Eye className="lp-eye-icon" />}
                </button>
              </div>
              <p className="lp-hint">नया उपयोगकर्ता? कोई भी PIN चुनें — खाता अपने आप बन जाएगा।</p>
            </div>

            {/* Submit error */}
            {error && (
              <div className="lp-error auth-slide-down" role="alert">
                <AlertCircle className="lp-error-icon" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy || !!phoneError || phone.length < 10}
              className="lp-btn"
            >
              {busy ? (
                <>
                  <Loader2 className="lp-btn-spin" aria-hidden />
                  <span>जारी है…</span>
                </>
              ) : (
                <span className="flex items-center gap-2">
                  जारी करें
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </span>
              )}
            </button>
          </form>

          <p className="lp-footer flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-700" strokeWidth={1.5} />
            आपका डेटा सुरक्षित और एन्क्रिप्टेड है
          </p>
        </div>
      </div>

      <style>{`
        /* ── Layout ─────────────────────────── */
        .lp-bg {
          min-height: 100vh;
          background: #071209;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .lp-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.15;
          pointer-events: none;
        }
        .lp-blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #16a34a, transparent 70%);
          top: -140px; right: -140px;
          animation: floatBlob1 14s ease-in-out infinite;
        }
        .lp-blob-2 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #0ea5e9, transparent 70%);
          bottom: -90px; left: -90px;
          animation: floatBlob2 18s ease-in-out infinite 3s;
        }

        .lp-center {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 24px 16px;
        }

        /* ── Card ───────────────────────────── */
        .lp-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 36px 32px 28px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(74,222,128,0.05);
        }
        @media (max-width: 480px) {
          .lp-card { padding: 28px 20px 24px; border-radius: 20px; }
        }

        /* ── Brand ──────────────────────────── */
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 30px;
        }
        .lp-logo-ring {
          width: 54px; height: 54px;
          border-radius: 15px;
          border: 1px solid rgba(74,222,128,0.22);
          background: rgba(74,222,128,0.07);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .lp-logo {
          width: 46px; height: 46px;
          object-fit: cover; border-radius: 11px;
        }
        .lp-brand-hi {
          font-size: 17px; font-weight: 700;
          color: #d1fae5; letter-spacing: -0.02em;
        }
        .lp-brand-en {
          font-size: 11px; font-weight: 500;
          color: #4ade80; margin-top: 2px;
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* ── Greeting ───────────────────────── */
        .lp-greet { margin-bottom: 28px; }
        .lp-title {
          font-size: 30px; font-weight: 800;
          color: #f8fafc; letter-spacing: -0.03em; line-height: 1.1;
        }
        .lp-sub {
          font-size: 13px; color: #64748b; margin-top: 5px;
        }

        /* ── Form ───────────────────────────── */
        .lp-form { display: flex; flex-direction: column; gap: 20px; }
        .lp-field { display: flex; flex-direction: column; gap: 7px; }
        .lp-label {
          font-size: 11.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #94a3b8;
        }

        /* ── Input row ──────────────────────── */
        .lp-input-row {
          position: relative;
          display: flex; align-items: center;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .lp-input-row:focus-within {
          background: rgba(255,255,255,0.07);
          border-color: rgba(74,222,128,0.5);
          box-shadow: 0 0 0 3px rgba(74,222,128,0.1);
        }
        .lp-input-row--err {
          border-color: rgba(239,68,68,0.5) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
        }
        .lp-input-row--ok {
          border-color: rgba(74,222,128,0.35);
        }

        .lp-icon {
          position: absolute; left: 14px;
          width: 16px; height: 16px;
          color: #475569; pointer-events: none; flex-shrink: 0;
        }
        .lp-prefix {
          position: absolute; left: 38px;
          font-size: 14px; color: #64748b; font-weight: 500;
          pointer-events: none; user-select: none;
        }
        .lp-ok-icon {
          position: absolute; right: 14px;
          width: 16px; height: 16px; color: #4ade80;
          pointer-events: none;
        }

        .lp-input {
          width: 100%; height: 52px;
          background: transparent;
          border: none; outline: none;
          color: #f1f5f9; font-size: 16px;
          font-family: inherit;
          caret-color: #4ade80;
        }
        .lp-input::placeholder { color: rgba(255,255,255,0.2); }
        .lp-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .lp-input--phone { padding: 0 40px 0 74px; letter-spacing: 0.06em; }
        .lp-input--pin   { padding: 0 48px 0 44px; letter-spacing: 0.22em; font-size: 18px; }

        .lp-eye {
          position: absolute; right: 13px;
          background: none; border: none; cursor: pointer;
          color: #475569; display: flex; align-items: center;
          transition: color 0.15s; padding: 6px;
          border-radius: 8px;
        }
        .lp-eye:hover { color: #94a3b8; background: rgba(255,255,255,0.06); }
        .lp-eye-icon { width: 15px; height: 15px; }

        /* ── Field-level error ──────────────── */
        .lp-field-err {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #fca5a5; margin-top: 2px;
        }
        .lp-field-err-icon { width: 13px; height: 13px; flex-shrink: 0; color: #f87171; }

        /* ── Hint ───────────────────────────── */
        .lp-hint { font-size: 11.5px; color: #334155; margin-top: 3px; }

        /* ── Submit error ───────────────────── */
        .lp-error {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #fca5a5; line-height: 1.5;
        }
        .lp-error-icon { width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px; color: #f87171; }

        /* ── Button ─────────────────────────── */
        .lp-btn {
          margin-top: 4px;
          height: 52px; width: 100%;
          border: none; border-radius: 14px; cursor: pointer;
          font-size: 15px; font-weight: 700; font-family: inherit;
          letter-spacing: 0.03em; color: #fff;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          box-shadow: 0 4px 20px rgba(22,163,74,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .lp-btn:hover:not(:disabled) {
          opacity: 0.9; transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(22,163,74,0.42);
        }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .lp-btn-spin { width: 16px; height: 16px; animation: spin 1s linear infinite; }

        /* ── Footer ─────────────────────────── */
        .lp-footer {
          margin-top: 22px; text-align: center;
          font-size: 11.5px; color: #1e293b;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
