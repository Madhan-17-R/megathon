import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AppProvider } from '@/lib/context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GreenScore \u2014 AI Home Energy Advisor',
  description:
    "Understand your home's energy efficiency with an AI-powered Green Home Score. Get personalised retrofit recommendations, carbon impact analysis, and a clear path to a greener home.",
  keywords: ['green home', 'energy efficiency', 'retrofit', 'EPC', 'carbon footprint', 'heat pump', 'solar panel'],
  openGraph: {
    title: 'GreenScore \u2014 AI Home Energy Advisor',
    description: "Discover your home's Green Score and unlock personalised retrofit recommendations.",
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
            <p>
              GreenScore — AI-Based Green Home Score & Retrofit Recommendation System.{' '}
              <span className="text-emerald-700">Demo estimates only — not financial or engineering advice.</span>
            </p>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
