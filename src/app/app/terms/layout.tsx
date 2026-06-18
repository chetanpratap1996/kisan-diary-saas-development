import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Kisan Diary. Read our terms and conditions for using our farm activity logging app.',
  openGraph: {
    title: 'Terms of Service | Kisan Diary',
    description: 'Terms of Service for Kisan Diary. Read our terms and conditions for using our farm activity logging app.',
    url: 'https://kisan.naturexpress.in/app/terms',
  },
  alternates: {
    canonical: 'https://kisan.naturexpress.in/app/terms',
  }
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
