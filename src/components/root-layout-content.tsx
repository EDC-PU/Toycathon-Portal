
"use client";

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ChatbotWidget from '@/components/chatbot-widget';
import { usePathname } from 'next/navigation';
import Head from 'next/head';


export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/profile') || pathname.startsWith('/join');
  

  if (isAppPage) {
    return (
        <body className={cn('min-h-screen bg-background font-body antialiased')}>
            <Head>
                <title>Vadodara Toycathon 2025 - Dashboard</title>
                <meta name="description" content="Manage your teams, submissions, and profile for the Vadodara Toycathon 2025." />
            </Head>
            {children}
            <ChatbotWidget />
            <Toaster />
        </body>
    )
  }

  return (
    <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
        )}
      >
        <Head>
            <script type="application/ld+json">
            {`
                {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": "Vadodara Toycathon 2025",
                "startDate": "2025-09-15",
                "endDate": "2025-10-08",
                "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
                "eventStatus": "https://schema.org/EventScheduled",
                "location": [
                    {
                        "@type": "VirtualLocation",
                        "url": "https://toycathon.pierc.org/"
                    },
                    {
                        "@type": "Place",
                        "name": "Parul University",
                        "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "P.O. Limda, Ta. Waghodia",
                        "addressLocality": "Vadodara",
                        "postalCode": "391760",
                        "addressRegion": "Gujarat",
                        "addressCountry": "IN"
                        }
                    }
                ],
                "image": [
                    "https://www.pierc.org/assets/PIERC.svg"
                ],
                "description": "A national-level competition for students from schools and universities in Vadodara to design and build innovative toys and games. Unleash your creativity and win exciting prizes.",
                "organizer": {
                    "@type": "Organization",
                    "name": "Parul Innovation and Entrepreneurship Research Centre (PIERC)",
                    "url": "https://www.pierc.org/"
                }
                }
            `}
            </script>
        </Head>
        <div className="relative flex min-h-dvh flex-col bg-background">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ChatbotWidget />
        <Toaster />
      </body>
  );
}
