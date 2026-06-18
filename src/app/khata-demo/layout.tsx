import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Khata Demo',
  description: 'Try the Kisan Diary Khata interactive demo. See how easy it is to track your farming expenses and incomes.',
  openGraph: {
    title: 'Khata Demo | Kisan Diary',
    description: 'Try the Kisan Diary Khata interactive demo. See how easy it is to track your farming expenses and incomes.',
    url: 'https://kisan.naturexpress.in/khata-demo',
  },
  alternates: {
    canonical: 'https://kisan.naturexpress.in/khata-demo',
  }
};

export default function KhataDemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
