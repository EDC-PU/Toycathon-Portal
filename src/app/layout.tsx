
"use client";

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import ChatbotWidget from '@/components/chatbot-widget';
import { usePathname } from 'next/navigation';
import Head from 'next/head';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAppPage = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/profile');
  const pageTitle = "Vadodara Toycathon 2025 - India's Premier Toy Design Challenge";
  const pageDescription = "Join the Vadodara Toycathon 2025! A national-level competition for school, college, and university students in Vadodara, Gujarat, to design and build innovative toys and games. Unleash your creativity and win exciting prizes.";


  if (isAppPage) {
    return (
       <html lang="en" suppressHydrationWarning>
        <head>
           <title>Vadodara Toycathon 2025 - Dashboard</title>
           <meta name="description" content="Manage your teams, submissions, and profile for the Vadodara Toycathon 2025." />
           <link rel="icon" href="https://paruluniversity.ac.in/favicon.ico" />
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
      <Head>
        <title>{pageTitle}</title>
        <link rel="icon" href="https://paruluniversity.ac.in/favicon.ico" />
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Vadodara Toycathon 2025, Toy Hackathon, school competition Vadodara, university competition Vadodara, college event Gujarat, toy design challenge, PIERC, Parul University" />
        <meta name="author" content="Parul Innovation and Entrepreneurship Research Centre (PIERC)" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://toycathon.pierc.org/" />
        <meta property="og:image" content="https://www.pierc.org/assets/PIERC.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.pierc.org/assets/PIERC.svg" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Vadodara Toycathon 2025",
              "startDate": "2025-08-15",
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
