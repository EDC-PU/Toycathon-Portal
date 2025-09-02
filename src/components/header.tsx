"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Blocks, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#about', label: 'About' },
  { href: '/#themes', label: 'Themes' },
  { href: '/#timeline', label: 'Timeline' },
  { href: '/#rules', label: 'Rules' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Blocks className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-primary">Toycathon 2025</span>
        </Link>
        
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Blocks className="h-6 w-6 text-primary" />
                    <span className="font-headline font-bold text-primary">Toycathon 2025</span>
                </Link>
                <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                    </Button>
                </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
