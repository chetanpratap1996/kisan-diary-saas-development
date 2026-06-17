"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Phone, Lock, Eye, EyeOff, Loader2, CheckCircle2, Wheat, ShieldCheck, ArrowRight, MessageCircle, KeyRound, Fingerprint, ScanFace } from "lucide-react";
import { useApp } from "@/context/AppContext";

// ─── Client-side phone validation (mirrors server-side) ───────────────────────
function validatePhone(phone: string): string | null {
  if (phone.length === 0) return null;
  if (!/^\d+$/.test(phone)) return "केवल अंक दर्ज करें";
  if (phone.length < 10) return null;
  if (!/^[6-9]/.test(phone)) return "नंबर 6, 7, 8 या 9 से शुरू होना चाहिए";

  const digits = phone.split("").map(Number);
  if (new Set(digits).size === 1) return "यह नंबर अमान्य है";
  for (let d = 0; d <= 9; d++) {
    if (digits.filter((x) => x === d).length >= 7) return "यह नंबर अमान्य है";
  }
  if (/(\d)\1{4,}/.test(phone)) return "यह नंबर अमान्य है";
  let asc = 0, desc = 0;
  for (let i = 0; i < 9; i++) {
    const diff = digits[i + 1] - digits[i];
    asc  = (diff === 1 || diff === -9) ? asc  + 1 : 0;
    desc = (diff === -1 || diff === 9) ? desc + 1 : 0;
    if (asc >= 7 || desc >= 7) return "यह नंबर अमान्य है";
  }
  if (phone.slice(0, 5) === phone.slice(5)) return "यह नंबर अमान्य है";
  if (/^(\d{2})\1{4}$/.test(phone)) return "यह नंबर अमान्य है";
  const blocked = new Set([
    "9876543210","8765432109","7654321098","6543210987",
    "9012345678","8901234567","7890123456","6789012345",
    "9999900000","9000000000","8000000000","7000000000","6000000000",
  ]);
  if (blocked.has(phone)) return "यह नंबर अमान्य है";
  return null;
}

type ForgotMode = 'none' | 'phone' | 'otp' | 'new-pin';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useApp();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Forgot PIN state
  const [forgotMode, setForgotMode] = useState<ForgotMode>('none');
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);

  // Biometric state
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [userDataForBio, setUserDataForBio] = useState<any>(null);
  const [userTokenForBio, setUserTokenForBio] = useState<string>("");

  useEffect(() => {
    // Check if device supports Fingerprint/FaceID via WebAuthn
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsBiometricSupported(available);
        })
        .catch(console.error);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user && !showBiometricPrompt) {
      router.replace(user.isAdmin ? "/admin/dashboard" : "/app/home");
    }
  }, [isLoading, router, user, showBiometricPrompt]);

  const handlePhoneChange = useCallback((raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
    setError("");
    setSuccessMsg("");
    if (cleaned.length === 10) {
      setPhoneError(validatePhone(cleaned));
    } else {
      setPhoneError(null);
    }
  }, []);

  const handlePinChange = useCallback((raw: string) => {
    setPin(raw.replace(/\D/g, "").slice(0, 6));
    setError("");
    setSuccessMsg("");
  }, []);
  
  const handleOtpChange = useCallback((raw: string) => {
    setOtp(raw.replace(/\D/g, "").slice(0, 6));
    setError("");
  }, []);

  const handleNewPinChange = useCallback((raw: string) => {
    setNewPin(raw.replace(/\D/g, "").slice(0, 6));
    setError("");
  }, []);

  const phoneValid = phone.length === 10 && phoneError === null;

  // ─── Normal Login Submit ─────────────────────────────────────────
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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

      // Check if we should prompt for biometric registration
      const hasBioRegisteredForPhone = localStorage.getItem('kisan_bio_phone') === phone;
      if (isBiometricSupported && !hasBioRegisteredForPhone) {
        setRegisteredPhone(phone);
        setUserDataForBio(data.data.user);
        setUserTokenForBio(data.data.token);
        setShowBiometricPrompt(true);
      } else {
        login(data.data.token, data.data.user);
        router.push(data.data.user.isAdmin ? "/admin/dashboard" : "/app/home");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "लॉगिन विफल रहा।");
    } finally {
      setBusy(false);
    }
  };

  // ─── Biometric Registration ─────────────────────────────────────────
  const handleEnableBiometric = async () => {
    setBusy(true);
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Kisan Diary" },
          user: {
            id: new TextEncoder().encode(registeredPhone),
            name: registeredPhone,
            displayName: "Kisan Farmer"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });
      if (cred) {
        localStorage.setItem('kisan_bio_phone', registeredPhone);
      }
    } catch (e: any) {
      if (e.name !== 'NotAllowedError') {
        console.error("Biometric registration failed", e);
        alert("फिंगरप्रिंट सेटअप विफल रहा। कृपया सुनिश्चित करें कि आपके डिवाइस में लॉक/फिंगरप्रिंट सक्षम है।");
      }
      // If NotAllowedError, user cancelled or no authenticator is setup. Just proceed to login.
    } finally {
      login(userTokenForBio, userDataForBio);
      router.push(userDataForBio?.isAdmin ? "/admin/dashboard" : "/app/home");
    }
  };

  const handleSkipBiometric = () => {
    login(userTokenForBio, userDataForBio);
    router.push(userDataForBio?.isAdmin ? "/admin/dashboard" : "/app/home");
  };

  // ─── Biometric Login ─────────────────────────────────────────
  const handleBiometricLogin = async () => {
    setBusy(true);
    setError("");
    try {
      const savedPhone = localStorage.getItem('kisan_bio_phone');
      if (!savedPhone) {
        throw new Error("फिंगरप्रिंट सेट नहीं है। कृपया पहले PIN से लॉगिन करें।");
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: "required"
        }
      });

      if (assertion) {
        // Authenticate with backend
        const res = await fetch("/api/auth/biometric-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: savedPhone }),
        });
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || "फिंगरप्रिंट लॉगिन विफल रहा।");
        }
        
        login(data.data.token, data.data.user);
        router.push(data.data.user.isAdmin ? "/admin/dashboard" : "/app/home");
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
         setError(err instanceof Error ? err.message : "फिंगरप्रिंट लॉगिन रद्द कर दिया गया या विफल रहा।");
      }
    } finally {
      setBusy(false);
    }
  };


  // ─── Forgot PIN Flows ─────────────────────────────────────────
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validatePhone(phone);
    if (err || phone.length !== 10) {
      setPhoneError(err ?? "10 अंकों का मोबाइल नंबर दर्ज करें");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setForgotMode('otp');
    }, 800);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) {
      setError("6 अंकों का OTP दर्ज करें");
      return;
    }
    if (otp !== "123456") {
      setError("OTP गलत है। फिर से प्रयास करें। (टेस्ट OTP: 123456)");
      return;
    }
    setForgotMode('new-pin');
  };

  const handleSetNewPin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPin.length < 4) {
      setError("नया PIN कम से कम 4 अंकों का होना चाहिए");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, newPin }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "PIN रीसेट विफल रहा।");
      }

      setSuccessMsg("आपका PIN सफलतापूर्वक रीसेट हो गया है! अब नए PIN से लॉगिन करें।");
      setForgotMode('none');
      setPin(newPin);
      setNewPin("");
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PIN रीसेट विफल रहा।");
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

  // ─── Render Biometric Prompt ─────────────────────────────────────────
  if (showBiometricPrompt) {
    return (
      <main className="lp-bg">
        <div className="lp-center">
          <div className="lp-card auth-scale-in text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">त्वरित लॉगिन</h1>
            <p className="text-slate-300 text-sm mb-8">क्या आप अगली बार से फिंगरप्रिंट या फेस आईडी के साथ तेजी से लॉगिन करना चाहते हैं?</p>
            
            <button 
              onClick={handleEnableBiometric}
              disabled={busy}
              className="lp-btn mb-4 w-full"
            >
              हाँ, फिंगरप्रिंट सक्षम करें
            </button>
            <button 
              onClick={handleSkipBiometric}
              disabled={busy}
              className="text-slate-400 hover:text-white font-medium"
            >
              नहीं, धन्यवाद
            </button>
          </div>
        </div>
        <style>{`
          .lp-bg { min-height: 100vh; background: #071209; display: flex; align-items: center; justify-content: center; }
          .lp-center { width: 100%; max-width: 420px; padding: 24px; }
          .lp-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 36px 32px; backdrop-filter: blur(28px); }
          .lp-btn { height: 52px; width: 100%; border: none; border-radius: 14px; font-weight: 700; color: #fff; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); }
        `}</style>
      </main>
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
            {forgotMode === 'none' && (
              <>
                <h1 className="lp-title flex items-center gap-2.5">
                  नमस्ते
                  <Wheat className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
                </h1>
                <p className="lp-sub">मोबाइल नंबर और PIN से जारी रखें</p>
              </>
            )}
            {forgotMode === 'phone' && (
              <>
                <h1 className="lp-title flex items-center gap-2.5 text-[24px]">
                  PIN रीसेट करें
                </h1>
                <p className="lp-sub">अपना पंजीकृत मोबाइल नंबर दर्ज करें</p>
              </>
            )}
            {forgotMode === 'otp' && (
              <>
                <h1 className="lp-title flex items-center gap-2.5 text-[24px]">
                  OTP सत्यापित करें
                </h1>
                <p className="lp-sub">हमने {phone} पर एक OTP भेजा है</p>
              </>
            )}
            {forgotMode === 'new-pin' && (
              <>
                <h1 className="lp-title flex items-center gap-2.5 text-[24px]">
                  नया PIN बनाएं
                </h1>
                <p className="lp-sub">अपने खाते के लिए एक नया 4-6 अंकों का PIN सेट करें</p>
              </>
            )}
          </div>

          {successMsg && (
            <div className="lp-success mb-5 auth-slide-down" role="alert">
              <CheckCircle2 className="lp-success-icon" aria-hidden />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Normal Login Form ────────────────────────────────── */}
          {forgotMode === 'none' && (
            <form onSubmit={handleLoginSubmit} noValidate className="lp-form">
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

              {/* Submit Button & Biometric Button */}
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={busy || !!phoneError || phone.length < 10}
                  className="lp-btn flex-1"
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
                
                {isBiometricSupported && (
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={busy}
                    aria-label="फिंगरप्रिंट से लॉगिन करें"
                    className="flex items-center justify-center bg-emerald-900/30 border border-emerald-500/20 hover:border-emerald-500/50 w-14 rounded-xl text-emerald-400 hover:bg-emerald-800/40 transition-all h-[52px]"
                  >
                    <Fingerprint className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Highly visible Forgot PIN button */}
              <button 
                type="button" 
                onClick={() => { setForgotMode('phone'); setError(""); setSuccessMsg(""); }}
                className="mt-4 text-[14px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors w-full text-center"
              >
                PIN भूल गए? (Forgot PIN)
              </button>
            </form>
          )}

          {/* ── Forgot PIN: Enter Phone ────────────────────────────────── */}
          {forgotMode === 'phone' && (
            <form onSubmit={handleSendOtp} noValidate className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-phone-forgot">मोबाइल नंबर</label>
                <div className={`lp-input-row ${phoneError ? "lp-input-row--err" : phoneValid ? "lp-input-row--ok" : ""}`}>
                  <Phone className="lp-icon" aria-hidden />
                  <span className="lp-prefix">+91</span>
                  <input
                    id="lp-phone-forgot"
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="lp-input lp-input--phone"
                    disabled={busy}
                    maxLength={10}
                  />
                </div>
              </div>
              
              {error && (
                <div className="lp-error auth-slide-down" role="alert">
                  <AlertCircle className="lp-error-icon" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={busy || !phoneValid} className="lp-btn">
                {busy ? <Loader2 className="lp-btn-spin" /> : "OTP भेजें"}
              </button>
              
              <button 
                type="button" 
                onClick={() => setForgotMode('none')}
                className="mt-3 text-sm font-semibold text-slate-400 hover:text-slate-300"
              >
                लॉगिन पर वापस जाएं
              </button>
            </form>
          )}

          {/* ── Forgot PIN: Verify OTP ────────────────────────────────── */}
          {forgotMode === 'otp' && (
            <form onSubmit={handleVerifyOtp} noValidate className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-otp">OTP (टेस्ट: 123456)</label>
                <div className="lp-input-row">
                  <KeyRound className="lp-icon" aria-hidden />
                  <input
                    id="lp-otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className="lp-input lp-input--pin"
                    disabled={busy}
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
              
              {error && (
                <div className="lp-error auth-slide-down" role="alert">
                  <AlertCircle className="lp-error-icon" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={busy || otp.length !== 6} className="lp-btn">
                सत्यापित करें
              </button>
              
              <button 
                type="button" 
                onClick={() => setForgotMode('phone')}
                className="mt-3 text-sm font-semibold text-slate-400 hover:text-slate-300"
              >
                नंबर बदलें
              </button>
            </form>
          )}

          {/* ── Forgot PIN: Set New PIN ────────────────────────────────── */}
          {forgotMode === 'new-pin' && (
            <form onSubmit={handleSetNewPin} noValidate className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="lp-new-pin">नया PIN</label>
                <div className="lp-input-row">
                  <Lock className="lp-icon" aria-hidden />
                  <input
                    id="lp-new-pin"
                    type={showNewPin ? "text" : "password"}
                    inputMode="numeric"
                    placeholder="नया 4-6 अंकों का PIN"
                    value={newPin}
                    onChange={(e) => handleNewPinChange(e.target.value)}
                    className="lp-input lp-input--pin"
                    disabled={busy}
                    maxLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowNewPin((v) => !v)}
                    tabIndex={-1}
                  >
                    {showNewPin ? <EyeOff className="lp-eye-icon" /> : <Eye className="lp-eye-icon" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="lp-error auth-slide-down" role="alert">
                  <AlertCircle className="lp-error-icon" aria-hidden />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={busy || newPin.length < 4} className="lp-btn">
                {busy ? <Loader2 className="lp-btn-spin" /> : "नया PIN सेव करें"}
              </button>
            </form>
          )}

          {/* ── Footer Info ─────────────────────────── */}
          {forgotMode === 'none' && (
            <p className="lp-footer flex items-center justify-center gap-1.5 mb-2 mt-[22px]">
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" strokeWidth={1.5} />
              आपका डेटा सुरक्षित और एन्क्रिप्टेड है
            </p>
          )}

          {/* ── WhatsApp Support Fallback ────────────────── */}
          <div className="mt-5 pt-5 border-t border-white/5 flex justify-center">
            <a 
              href="https://wa.me/918077170715?text=नमस्ते,%20मुझे%20Kisan%20Diary%20लॉगिन%20में%20मदद%20चाहिए।" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full gap-2 text-[15px] font-bold text-[#25D366] hover:text-[#1ebe5b] transition-all bg-[#25D366]/10 hover:bg-[#25D366]/20 px-4 py-3.5 rounded-xl border border-[#25D366]/30 shadow-lg shadow-[#25D366]/5"
            >
              <MessageCircle className="w-5 h-5" fill="currentColor" />
              WhatsApp पर सहायता लें
            </a>
          </div>
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

        /* ── Submit error / success ─────────── */
        .lp-error {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #fca5a5; line-height: 1.5;
        }
        .lp-error-icon { width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px; color: #f87171; }

        .lp-success {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #6ee7b7; line-height: 1.5;
        }
        .lp-success-icon { width: 15px; height: 15px; flex-shrink: 0; margin-top: 1px; color: #34d399; }

        /* ── Button ─────────────────────────── */
        .lp-btn {
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
          text-align: center;
          font-size: 11.5px; color: #1e293b;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        
        .auth-scale-in {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .auth-slide-down {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
