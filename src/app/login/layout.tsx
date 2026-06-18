import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your Kisan Diary account to manage your farm activities, expenses, and harvests securely.',
  openGraph: {
    title: 'Login | Kisan Diary',
    description: 'Log in to your Kisan Diary account to manage your farm activities, expenses, and harvests securely.',
    url: 'https://kisan.naturexpress.in/login',
  },
  alternates: {
    canonical: 'https://kisan.naturexpress.in/login',
  }
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
