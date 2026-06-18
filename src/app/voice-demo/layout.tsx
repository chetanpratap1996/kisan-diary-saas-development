import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice Khata Demo',
  description: 'Try the voice-powered expense logging demo for Indian farmers. Speak your expenses naturally and let Kisan Diary log them automatically.',
  openGraph: {
    title: 'Voice Khata Demo | Kisan Diary',
    description: 'Try the voice-powered expense logging demo for Indian farmers. Speak your expenses naturally and let Kisan Diary log them automatically.',
    url: 'https://kisan.naturexpress.in/voice-demo',
  },
  alternates: {
    canonical: 'https://kisan.naturexpress.in/voice-demo',
  }
};

export default function VoiceDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
