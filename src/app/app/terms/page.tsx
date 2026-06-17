"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 pt-12 pb-6 shadow-md relative">
        <button onClick={() => router.back()} className="absolute top-12 left-4 text-white hover:bg-white/20 p-2 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center mt-2">
          <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white">उपयोग की शर्तें</h1>
          <p className="text-blue-100 text-sm mt-1">Terms & Conditions</p>
        </div>
      </div>
      
      <div className="px-5 py-6 space-y-6 text-slate-700 leading-relaxed text-sm bg-white min-h-[60vh] rounded-t-3xl -mt-4 relative z-10 shadow-sm border-t border-slate-100">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. सेवा की शर्तें स्वीकार करना</h2>
          <p>
            किसान डायरी ऐप का इस्तेमाल करके, आप इन नियमों और शर्तों से सहमत होते हैं। अगर आप सहमत नहीं हैं, तो कृपया ऐप का उपयोग न करें।
          </p>
        </section>
        
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">2. उपयोगकर्ता की जिम्मेदारी</h2>
          <p>
            ऐप में दर्ज किया गया सारा डेटा (जैसे हिसाब-किताब, खर्चे और बिक्री) आपकी अपनी जिम्मेदारी है। ऐप सिर्फ आपके डेटा को रिकॉर्ड करने और प्रबंधित करने में मदद करता है।
          </p>
        </section>
        
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">3. सेवा में बदलाव या रुकावट</h2>
          <p>
            हम बिना किसी पूर्व सूचना के ऐप के किसी भी फीचर को अपडेट करने, बदलने या हटाने का अधिकार सुरक्षित रखते हैं। तकनीकी कारणों से सेवा में रुकावट आ सकती है, जिसके लिए हम जिम्मेदार नहीं होंगे।
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900 mb-2">4. खाते की सुरक्षा</h2>
          <p>
            अपने अकाउंट और पिन (PIN) की गोपनीयता बनाए रखना आपकी जिम्मेदारी है। अपने लॉगिन डिटेल्स किसी के साथ साझा न करें।
          </p>
        </section>
      </div>
    </div>
  );
}
