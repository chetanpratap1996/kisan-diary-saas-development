import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Kisan Diary. Learn how we collect, use, and protect your data.',
  openGraph: {
    title: 'Privacy Policy | Kisan Diary',
    description: 'Privacy Policy for Kisan Diary. Learn how we collect, use, and protect your data.',
    url: 'https://kisan.naturexpress.in/app/privacy',
  },
  alternates: {
    canonical: 'https://kisan.naturexpress.in/app/privacy',
  }
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
