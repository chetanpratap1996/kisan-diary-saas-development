"use client";

import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 pt-12 pb-6 shadow-md relative">
        <button onClick={() => router.back()} className="absolute top-12 left-4 text-white hover:bg-white/20 p-2 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center mt-2">
          <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white">प्राइवेसी पॉलिसी</h1>
          <p className="text-emerald-100 text-sm mt-1">आपकी प्राइवेसी हमारी जिम्मेदारी</p>
        </div>
      </div>
      
      <div className="px-5 py-6 space-y-6 text-slate-700 leading-relaxed text-sm bg-white min-h-[60vh] rounded-t-3xl -mt-4 relative z-10 shadow-sm border-t border-slate-100">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. हम कौन सी जानकारी जमा करते हैं?</h2>
          <p>
            जब आप किसान डायरी ऐप का इस्तेमाल करते हैं, तो हम आपका नाम, मोबाइल नंबर, और आपके खेतों से जुड़ी जानकारी (जैसे फसल, खर्च और आमदनी) सुरक्षित रूप से सेव करते हैं ताकि आप इसे कभी भी देख सकें।
          </p>
        </section>
        
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">2. आपकी जानकारी का उपयोग</h2>
          <p>
            आपकी जानकारी का इस्तेमाल सिर्फ आपको बेहतर सर्विस देने और ऐप के फीचर्स को सही तरीके से काम करने के लिए किया जाता है। हम आपका व्यक्तिगत डेटा किसी तीसरी पार्टी (थर्ड पार्टी) को नहीं बेचते।
          </p>
        </section>
        
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">3. डेटा की सुरक्षा</h2>
          <p>
            आपका डेटा पूरी तरह से सुरक्षित (Encrypted) है। आपके अलावा कोई और आपकी अनुमति के बिना आपके खातों की जानकारी नहीं देख सकता।
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">4. संपर्क करें</h2>
          <p>
            अगर आपके पास हमारी प्राइवेसी पॉलिसी के बारे में कोई सवाल है, तो कृपया ऐप के सहायता सेक्शन (WhatsApp) के जरिए हमसे संपर्क करें।
          </p>
        </section>
      </div>
    </div>
  );
}
