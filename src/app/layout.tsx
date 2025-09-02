import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ChatbotWidget from '@/components/chatbot-widget';

export const metadata: Metadata = {
  title: 'Vadodara Toycathon 2025',
  description: 'Unleash your creativity at the Vadodara Toycathon 2025. Build innovative toys and games for a chance to win exciting prizes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <div className="relative flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ChatbotWidget />
        <Toaster />
      </body>
    </html>
  );
}
