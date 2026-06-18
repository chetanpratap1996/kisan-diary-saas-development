"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  TrendingUp,
  CloudSun,
  Sprout,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Globe2,
  Sparkles,
  Play,
  Download,
  Star,
  CheckCircle2,
  BarChart3,
  Mic,
  BookText,
  Store,
  IndianRupee,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Testimonials Data ────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "रामलाल वर्मा",
    location: "उत्तर प्रदेश",
    text: "किसान डायरी ने मेरे खेत का पूरा हिसाब-किताब आसान कर दिया। अब मुझे पता रहता है कि कितना खर्चा हुआ और कितनी कमाई।",
    stars: 5,
    crop: "गेहूं किसान",
  },
  {
    name: "सुखविंदर सिंह",
    location: "पंजाब",
    text: "ਮੈਨੂੰ ਇਹ ਐਪ ਬਹੁਤ ਪਸੰਦ ਹੈ। ਮੰਡੀ ਦੇ ਭਾਅ ਅਤੇ ਖਰਚੇ ਦੋਵੇਂ ਇੱਕ ਥਾਂ ਮਿਲਦੇ ਹਨ।",
    stars: 5,
    crop: "ਕਪਾਹ ਕਿਸਾਨ",
  },
  {
    name: "दत्तात्रय पाटील",
    location: "महाराष्ट्र",
    text: "या ॲपमुळे माझ्या शेतीचे सगळे हिशोब व्यवस्थित झाले. आवाज वापरून खर्च नोंदवणे खूपच सोपे आहे।",
    stars: 5,
    crop: "सोयाबीन शेतकरी",
  },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
const howItWorksSteps = [
  {
    icon: Smartphone,
    titleKey: "stepOneTitle" as TranslationKey,
    descKey: "stepOneDesc" as TranslationKey,
    titleFallback: "रजिस्टर करें",
    descFallback: "बस अपना मोबाइल नंबर डालें और मुफ़्त में शुरू करें",
    color: "bg-green-50",
    iconColor: "text-green-600",
    number: "01",
  },
  {
    icon: Leaf,
    titleKey: "stepTwoTitle" as TranslationKey,
    descKey: "stepTwoDesc" as TranslationKey,
    titleFallback: "अपना खेत जोड़ें",
    descFallback: "खेत का नाम, आकार और फसल की जानकारी भरें",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    number: "02",
  },
  {
    icon: Mic,
    titleKey: "stepThreeTitle" as TranslationKey,
    descKey: "stepThreeDesc" as TranslationKey,
    titleFallback: "आवाज़ से रिकॉर्ड करें",
    descFallback: "बोलकर खर्चा और कमाई नोट करें — टाइपिंग की ज़रूरत नहीं",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    number: "03",
  },
  {
    icon: BarChart3,
    titleKey: "stepFourTitle" as TranslationKey,
    descKey: "stepFourDesc" as TranslationKey,
    titleFallback: "रिपोर्ट देखें",
    descFallback: "फसल का पूरा हिसाब — नफ़ा-नुकसान एक क्लिक में",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    number: "04",
  },
];

// ─── Pricing Plans ────────────────────────────────────────────────────────────
const pricingPlans = [
  {
    name: "मुफ़्त",
    nameEn: "Free",
    price: "₹0",
    period: "हमेशा के लिए",
    description: "छोटे किसानों के लिए",
    features: [
      "1 खेत तक",
      "खर्चा और कमाई ट्रैकिंग",
      "आवाज़ से एंट्री",
      "मंडी भाव",
      "बेसिक रिपोर्ट",
    ],
    cta: "अभी शुरू करें",
    highlighted: false,
  },
  {
    name: "किसान प्रो",
    nameEn: "Kisan Pro",
    price: "₹199",
    period: "प्रति माह",
    description: "बड़े किसानों के लिए",
    features: [
      "असीमित खेत",
      "AI फसल सलाह",
      "उन्नत विश्लेषण",
      "खाता-बही (Ledger)",
      "WhatsApp रिपोर्ट",
      "प्राथमिकता सहायता",
    ],
    cta: "14 दिन मुफ़्त",
    highlighted: true,
  },
];

export default function RootPage() {
  const { user, isLoading, language, setLanguage } = useApp();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  useEffect(() => {
    setMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = useCallback(async () => {
    type InstallPrompt = { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    const raw = deferredPrompt || (window as { deferredPrompt?: unknown }).deferredPrompt;
    const promptEvent = raw as unknown as InstallPrompt | null;
    if (promptEvent && promptEvent.prompt) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        (window as { deferredPrompt?: unknown }).deferredPrompt = undefined;
      }
    }
  }, [deferredPrompt]);


  const handleActionClick = useCallback(() => {
    if (!isLoading) {
      if (user) {
        router.push(user.isAdmin ? "/admin/dashboard" : "/app/home");
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, user, router]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "hi" : "en");
  }, [language, setLanguage]);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-200">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header role="banner">
        <nav
          aria-label="Main navigation"
          className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="Kisan Diary Logo"
                width={48}
                height={48}
                className="rounded-full shadow-sm"
                priority
              />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-green-600">
                Kisan Diary
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 mr-4">
                <a href="#features" className="hover:text-green-600 transition-colors">
                  {t(language, "features" as TranslationKey)}
                </a>
                <a href="#how-it-works" className="hover:text-green-600 transition-colors">
                  {t(language, "howItWorks" as TranslationKey)}
                </a>
                <a href="#testimonials" className="hover:text-green-600 transition-colors">
                  {t(language, "stories" as TranslationKey)}
                </a>
                <a href="#pricing" className="hover:text-green-600 transition-colors">
                  Pricing
                </a>
                <button
                  onClick={toggleLanguage}
                  aria-label="Switch language"
                  className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors border border-green-200 flex items-center gap-1.5"
                >
                  <Globe2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {language === "en" ? "हिंदी" : "English"}
                </button>
              </div>

              {mounted && (
                <Button
                  onClick={handleInstallApp}
                  variant="outline"
                  aria-label="Download Kisan Diary app"
                  className="hidden md:flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50 rounded-full px-4 shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download App
                </Button>
              )}

              {mounted && (
                <Button
                  onClick={handleActionClick}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
                  disabled={isLoading}
                  aria-label={isLoading ? "Loading" : user ? "Go to dashboard" : "Login"}
                >
                  {isLoading
                    ? t(language, "loading" as TranslationKey)
                    : user
                    ? t(language, "goToDashboard" as TranslationKey)
                    : t(language, "login" as TranslationKey)}
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section aria-labelledby="hero-heading" className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-transparent rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              The #1 Farm Management App in India
            </div>
            <h1
              id="hero-heading"
              className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight"
            >
              {t(language, "landingTitle" as TranslationKey).split(",")[0]}{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                {t(language, "landingTitle" as TranslationKey).split(",")[1] || ""}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t(language, "landingSubtitle" as TranslationKey)}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handleActionClick}
                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-xl shadow-green-600/20 hover:shadow-2xl hover:shadow-green-600/30 transition-all group"
                aria-label="Get started for free"
              >
                {t(language, "startManaging" as TranslationKey)}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
              <Link
                href="/khata-demo"
                className="inline-flex items-center justify-center rounded-full px-8 h-14 text-lg w-full sm:w-auto border border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 font-medium transition-colors"
                aria-label="View live demo"
              >
                <Play className="w-4 h-4" strokeWidth={2} fill="currentColor" aria-hidden="true" />
                {t(language, "viewDemo" as TranslationKey)}
              </Link>
              {mounted && (
                <Button
                  size="lg"
                  onClick={handleInstallApp}
                  className="bg-black hover:bg-gray-800 text-white rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-xl transition-all flex items-center gap-2"
                  aria-label="Install Kisan Diary as app"
                >
                  <Download className="w-5 h-5" aria-hidden="true" />
                  Download App
                </Button>
              )}
            </div>

            {/* Stats bar */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center">
              {[
                { label: "Active Farmers", value: "10,000+" },
                { label: "States Covered", value: "28+" },
                { label: "Languages", value: "4" },
                { label: "Rating", value: "4.8 ★" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-2xl font-extrabold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-gray-500 mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="py-24 bg-gray-50/50 border-t border-gray-100 relative"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {t(language, "enterpriseTools" as TranslationKey)}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t(language, "enterpriseToolsDesc" as TranslationKey)}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow card-hover group">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(language, "financialAnalytics" as TranslationKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(language, "financialAnalyticsDesc" as TranslationKey)}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow card-hover group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Sprout className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(language, "cropLifecycle" as TranslationKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(language, "cropLifecycleDesc" as TranslationKey)}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow card-hover group">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <CloudSun className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(language, "smartPlanning" as TranslationKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(language, "smartPlanningDesc" as TranslationKey)}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow card-hover group">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <Smartphone className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(language, "mobileFirst" as TranslationKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(language, "mobileFirstDesc" as TranslationKey)}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-shadow card-hover group">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <ShieldCheck className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(language, "securePrivate" as TranslationKey)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(language, "securePrivateDesc" as TranslationKey)}
                </p>
              </div>

              {/* Feature 6 — CTA */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-3xl shadow-lg flex flex-col justify-between text-white card-hover relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" aria-hidden="true" />
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    {t(language, "readyTransform" as TranslationKey)}
                  </h3>
                  <p className="text-green-100 mb-8 leading-relaxed">
                    {t(language, "readyTransformDesc" as TranslationKey)}
                  </p>
                </div>
                <Button
                  onClick={handleActionClick}
                  className="bg-white text-green-700 hover:bg-gray-50 rounded-xl py-6 w-full font-bold group"
                  aria-label="Get started for free"
                >
                  {t(language, "getStartedFree" as TranslationKey)}
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="py-24 bg-white border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="how-it-works-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {language === "en" ? "How It Works" : "कैसे काम करता है?"}
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                {language === "en"
                  ? "Get started in minutes — no technical knowledge needed."
                  : "मिनटों में शुरू करें — कोई तकनीकी ज्ञान की ज़रूरत नहीं।"}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step) => (
                <div key={step.number} className="relative text-center group">
                  {/* Connector line */}
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-100 z-0" aria-hidden="true" />

                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform relative z-10`} aria-hidden="true">
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                  <div className="text-3xl font-black text-gray-100 mb-2">{step.number}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.titleFallback}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.descFallback}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── App Features Banner ───────────────────────────────────────────── */}
        <section
          aria-labelledby="app-modules-heading"
          className="py-16 bg-green-600"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="app-modules-heading" className="text-center text-white text-2xl font-bold mb-8">
              {language === "en" ? "Everything in One App" : "सब कुछ एक ऐप में"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookText, label: language === "en" ? "Khata Ledger" : "खाता-बही", sub: language === "en" ? "Track every rupee" : "हर रुपये का हिसाब" },
                { icon: Store, label: language === "en" ? "Mandi Prices" : "मंडी भाव", sub: language === "en" ? "Live market rates" : "आज के भाव" },
                { icon: IndianRupee, label: language === "en" ? "Credit/Loan" : "उधार/ऋण", sub: language === "en" ? "Who owes what" : "किसने क्या लिया" },
                { icon: BarChart3, label: language === "en" ? "Analytics" : "विश्लेषण", sub: language === "en" ? "Profit & loss" : "नफ़ा-नुकसान" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2 bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <item.icon className="w-7 h-7 text-white" aria-hidden="true" />
                  <span className="font-bold text-white text-sm">{item.label}</span>
                  <span className="text-green-100 text-xs">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────────── */}
        <section
          id="testimonials"
          aria-labelledby="testimonials-heading"
          className="py-24 bg-gray-50 border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Farmers Love Kisan Diary" : "किसान भाइयों की बात"}
              </h2>
              <p className="text-gray-600">
                {language === "en"
                  ? "Trusted by thousands of farmers across India"
                  : "पूरे भारत के हज़ारों किसानों का भरोसा"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                  aria-label={`Testimonial from ${testimonial.name}`}
                >
                  <div className="flex items-center gap-1 mb-4" aria-label={`${testimonial.stars} out of 5 stars`}>
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote>
                    <p className="text-gray-700 leading-relaxed text-sm mb-4">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                  </blockquote>
                  <figcaption className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm" aria-hidden="true">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">{testimonial.crop} · {testimonial.location}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────────── */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          className="py-24 bg-white border-t border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="pricing-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Simple, Transparent Pricing" : "सरल और साफ़ कीमत"}
              </h2>
              <p className="text-gray-600">
                {language === "en"
                  ? "Start free, upgrade when you're ready."
                  : "मुफ़्त में शुरू करें, जब चाहें अपग्रेड करें।"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 border ${
                    plan.highlighted
                      ? "bg-green-600 border-green-600 shadow-xl shadow-green-600/20"
                      : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className={`text-sm font-semibold mb-1 ${plan.highlighted ? "text-green-100" : "text-gray-500"}`}>
                    {plan.description}
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className={`flex items-baseline gap-1 mb-6 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? "text-green-100" : "text-gray-500"}`}>/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8" aria-label={`${plan.name} features`}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-green-200" : "text-green-600"}`}
                          aria-hidden="true"
                        />
                        <span className={`text-sm ${plan.highlighted ? "text-green-50" : "text-gray-700"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={handleActionClick}
                    className={`w-full rounded-xl py-6 font-bold ${
                      plan.highlighted
                        ? "bg-white text-green-700 hover:bg-green-50"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    aria-label={`${plan.cta} - ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          className="py-24 bg-gray-900 text-white border-t border-gray-800"
        >
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 id="cta-heading" className="text-3xl lg:text-4xl font-bold mb-4">
              {language === "en"
                ? "Start Managing Your Farm Today"
                : "आज ही अपना खेत संभालें"}
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              {language === "en"
                ? "Free forever. No credit card needed. Works offline too."
                : "हमेशा मुफ़्त। कोई क्रेडिट कार्ड नहीं। ऑफलाइन भी काम करता है।"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleActionClick}
                className="bg-green-600 hover:bg-green-500 text-white rounded-full px-8 h-14 text-lg shadow-xl shadow-green-600/20 group"
                aria-label="Get started for free"
              >
                {language === "en" ? "Get Started Free" : "मुफ़्त शुरू करें"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Button>
              {mounted && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleInstallApp}
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-14 text-lg gap-2"
                  aria-label="Install app"
                >
                  <Download className="w-5 h-5" aria-hidden="true" />
                  {language === "en" ? "Install App" : "ऐप इंस्टॉल करें"}
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer aria-label="Site footer" className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpg"
                alt="Kisan Diary Logo"
                width={48}
                height={48}
                className="rounded-full bg-white shadow"
              />
              <span className="text-2xl font-bold text-white">Kisan Diary</span>
            </div>
            <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
              Building the digital infrastructure for modern Indian agriculture.
              Empowering farmers with technology in their own language.
            </p>
          </div>
          <nav aria-label="Product links">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-green-400 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
              <li><Link href="/khata-demo" className="hover:text-green-400 transition-colors">Khata Demo</Link></li>
              <li><Link href="/voice-demo" className="hover:text-green-400 transition-colors">Voice Demo</Link></li>
              {mounted && (
                <li>
                  <button onClick={handleInstallApp} className="hover:text-green-400 transition-colors text-left">
                    Mobile App
                  </button>
                </li>
              )}
            </ul>
          </nav>
          <nav aria-label="Company links">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/app/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/app/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              <li>
                <a
                  href="https://wa.me/918077170715"
                  className="hover:text-green-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contact us on WhatsApp"
                >
                  Contact (WhatsApp)
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Kisan Diary by Naturexpress. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/app/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/app/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
