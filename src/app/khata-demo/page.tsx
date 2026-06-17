import { VoiceKhataButton } from "@/components/khata/VoiceKhataButton";

export default function KhataDemoPage() {
  return (
    <main className="min-h-screen bg-[#071209] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-green-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="z-10 text-center mb-12 space-y-4 max-w-2xl">
        <div className="inline-block px-4 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-sm font-semibold tracking-wide uppercase">
          Enterprise Voice AI Khata
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Speak Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Ledger</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Tap the mic and speak naturally. For example: 
          <br/>
          <span className="italic text-zinc-300">"मैंने आज 2000 रुपये में 50 लीटर दूध बेचा"</span>
        </p>
      </div>

      <div className="z-10 w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
        <VoiceKhataButton />
      </div>
    </main>
  );
}
