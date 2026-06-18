import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 pt-12 pb-6 shadow-md relative">
        <Link
          href="/app/settings"
          aria-label="Go back"
          className="absolute top-12 left-4 text-white hover:bg-white/20 p-2 rounded-full transition focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={24} aria-hidden="true" />
        </Link>
        <div className="text-center mt-2">
          <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3" aria-hidden="true">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white">उपयोग की शर्तें</h1>
          <p className="text-blue-100 text-sm mt-1">Terms &amp; Conditions</p>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6 text-slate-700 leading-relaxed text-sm bg-white min-h-[60vh] rounded-t-3xl -mt-4 relative z-10 shadow-sm border-t border-slate-100">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" aria-hidden="true" />

        <section aria-labelledby="terms-1">
          <h2 id="terms-1" className="text-base font-bold text-slate-900 mb-2">
            1. सेवा की शर्तें स्वीकार करना
          </h2>
          <p>
            किसान डायरी ऐप का इस्तेमाल करके, आप इन नियमों और शर्तों से सहमत होते हैं। अगर आप सहमत नहीं हैं, तो कृपया ऐप का उपयोग न करें।
          </p>
        </section>

        <section aria-labelledby="terms-2">
          <h2 id="terms-2" className="text-base font-bold text-slate-900 mb-2">
            2. उपयोगकर्ता की जिम्मेदारी
          </h2>
          <p>
            ऐप में दर्ज किया गया सारा डेटा (जैसे हिसाब-किताब, खर्चे और बिक्री) आपकी अपनी जिम्मेदारी है। ऐप सिर्फ आपके डेटा को रिकॉर्ड करने और प्रबंधित करने में मदद करता है।
          </p>
        </section>

        <section aria-labelledby="terms-3">
          <h2 id="terms-3" className="text-base font-bold text-slate-900 mb-2">
            3. सेवा में बदलाव या रुकावट
          </h2>
          <p>
            हम बिना किसी पूर्व सूचना के ऐप के किसी भी फीचर को अपडेट करने, बदलने या हटाने का अधिकार सुरक्षित रखते हैं। तकनीकी कारणों से सेवा में रुकावट आ सकती है, जिसके लिए हम जिम्मेदार नहीं होंगे।
          </p>
        </section>

        <section aria-labelledby="terms-4">
          <h2 id="terms-4" className="text-base font-bold text-slate-900 mb-2">
            4. खाते की सुरक्षा
          </h2>
          <p>
            अपने अकाउंट और पिन (PIN) की गोपनीयता बनाए रखना आपकी जिम्मेदारी है। अपने लॉगिन डिटेल्स किसी के साथ साझा न करें।
          </p>
        </section>

        <section aria-labelledby="terms-5">
          <h2 id="terms-5" className="text-base font-bold text-slate-900 mb-2">
            5. मूल्य निर्धारण
          </h2>
          <p>
            किसान डायरी का बेसिक संस्करण हमेशा मुफ़्त रहेगा। प्रीमियम सुविधाओं के लिए शुल्क लागू हो सकता है, जिसकी जानकारी पहले दी जाएगी।
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
          अंतिम अपडेट: जून 2025 &nbsp;·&nbsp;
          <Link href="/app/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
