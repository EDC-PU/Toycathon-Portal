
import type { Metadata } from 'next';
import './globals.css';
import RootLayoutContent from '@/components/root-layout-content';

const pageTitle = "Vadodara Toycathon 2025 - India's Premier Toy Design Challenge";
const pageDescription = "Join the Vadodara Toycathon 2025! A national-level competition for school, college, and university students in Vadodara, Gujarat, to design and build innovative toys and games. Unleash your creativity and win exciting prizes.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: "Vadodara Toycathon 2025, Toy Hackathon, school competition Vadodara, university competition Vadodara, college event Gujarat, toy design challenge, PIERC, Parul University",
  authors: [{ name: "Parul Innovation and Entrepreneurship Research Centre (PIERC)" }],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: "https://toycathon.pierc.org/",
    images: ["https://www.pierc.org/assets/PIERC.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["https://www.pierc.org/assets/PIERC.svg"],
  },
  icons: {
    icon: 'https://mnaignsupdlayf72.public.blob.vercel-storage.com/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <RootLayoutContent>{children}</RootLayoutContent>
    </html>
  );
}
