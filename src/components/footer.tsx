import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, Pin } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/50">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center md:items-start">
                <p className="font-headline text-lg font-bold text-primary">Vadodara Toycathon 2025</p>
                <p className="mt-2 text-sm text-muted-foreground text-center md:text-left">&copy; {new Date().getFullYear()} All rights reserved.</p>
                 <div className="mt-4 flex items-center gap-4">
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Button variant="ghost" size="icon">
                            <Instagram className="h-5 w-5" />
                        </Button>
                    </a>
                     <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <Button variant="ghost" size="icon">
                            <Facebook className="h-5 w-5" />
                        </Button>
                    </a>
                     <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Button variant="ghost" size="icon">
                            <Linkedin className="h-5 w-5" />
                        </Button>
                    </a>
                </div>
            </div>

            <div className="flex flex-col items-center text-sm">
                <h3 className="font-semibold text-foreground">Contact Us</h3>
                <div className="mt-4 space-y-2 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:pierc@paruluniversity.ac.in" className="hover:text-primary">pierc@paruluniversity.ac.in</a>
                    </div>
                     <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Manish Jain - 9131445130</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center md:items-end">
                 <h3 className="font-semibold text-foreground">Organised By</h3>
                 <div className="mt-4 flex items-center gap-8">
                    <a href="https://paruluniversity.ac.in/" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-80">
                        <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={140} height={32} className="h-8 w-auto object-contain" />
                    </a>
                    <a href="https://www.pierc.org/" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-80">
                        <Image src="https://www.pierc.org/assets/PIERC.svg" alt="PIERC Logo" width={80} height={32} className="h-8 w-auto object-contain" />
                    </a>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
