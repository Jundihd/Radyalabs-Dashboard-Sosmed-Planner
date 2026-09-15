import type { Metadata } from 'next';
import { Exo_2, Raleway } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import PostDetailModal from '@/components/PostDetailModal';
import RejectModal from '@/components/RejectModal';
import ManualMetricsModal from '@/components/ManualMetricsModal';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Radya Labs — Social Media System',
  description: 'Internal multi-brand planning, AI drafting, and approval system for Radya Labs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${exo2.variable} ${raleway.variable}`}>
      <body>
        <AppProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 p-8 pb-16 overflow-y-auto">
                {children}
              </main>
              <footer className="py-4 px-8 border-t border-[var(--navy-line)] text-[12px] text-[var(--slate-400)] flex items-center justify-between">
                <span>Radya Labs Social Media System · v1 Planning &amp; Publishing Prototype</span>
                <span>radya.id</span>
              </footer>
            </div>
          </div>
          <PostDetailModal />
          <RejectModal />
          <ManualMetricsModal />
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
