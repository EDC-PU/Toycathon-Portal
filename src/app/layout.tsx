
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ChatbotWidget from '@/components/chatbot-widget';
import { usePathname } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Vadodara Toycathon 2025',
//   description: 'Unleash your creativity at the Vadodara Toycathon 2025. Build innovative toys and games for a chance to win exciting prizes.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return (
       <html lang="en" suppressHydrationWarning>
        <head>
           <title>Vadodara Toycathon 2025 - Dashboard</title>
        </head>
        <body className={cn('min-h-screen bg-background font-body antialiased')}>
            {children}
            <ChatbotWidget />
            <Toaster />
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <title>Vadodara Toycathon 2025</title>
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
