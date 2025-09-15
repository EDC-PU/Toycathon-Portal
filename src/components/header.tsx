
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Menu, LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import HeaderAuth from './header-auth';


const navLinks = [
  { href: '/#about', label: 'About' },
  { href: '/#themes', label: 'Themes' },
  { href: '/#timeline', label: 'Timeline' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="hidden md:block">
              <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={180} height={50} className="h-12 w-auto object-contain" />
          </Link>
          <Link href="/" className="pl-4 md:pl-0">
              <Image src="https://www.pierc.org/assets/PIERC.svg" alt="PIERC Logo" width={100} height={50} className="h-16 w-auto object-contain" />
          </Link>
        </div>
        
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
            <Suspense fallback={<Loader2 className="animate-spin" />}>
                <HeaderAuth />
            </Suspense>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex h-full flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                </Link>
                <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-4">
                    <Suspense fallback={<Loader2 className="animate-spin" />}>
                        <HeaderAuth isMobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
                    </Suspense>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <a href="https://paruluniversity.ac.in/" target="_blank" rel="noopener noreferrer">
                            <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={140} height={32} className="h-8 w-auto object-contain" />
                        </a>
                        <a href="https://www.pierc.org/" target="_blank" rel="noopener noreferrer">
                            <Image src="https://www.pierc.org/assets/PIERC.svg" alt="PIERC Logo" width={80} height={32} className="h-8 w-auto object-contain" />
                        </a>
                    </div>
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
