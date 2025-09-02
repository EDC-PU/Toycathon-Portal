import Link from 'next/link';
import type { SVGProps } from 'react';

function PiercLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
        <text x="50" y="25" fontFamily="Montserrat, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle" fill="currentColor">
          PIERC
        </text>
      </svg>
    );
  }
  
  function ParulUniversityLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
        <text x="100" y="25" fontFamily="Montserrat, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="currentColor">
          PARUL UNIVERSITY
        </text>
      </svg>
    );
  }

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/50">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex flex-col items-center md:items-start">
                <p className="font-headline text-lg font-bold text-primary">Vadodara Toycathon 2025</p>
                <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          <div className="flex items-center gap-8">
            <p className="text-sm font-semibold text-muted-foreground">In collaboration with:</p>
            <a href="https://paruluniversity.ac.in/" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-80">
                <ParulUniversityLogo className="h-8 w-auto" />
            </a>
            <a href="https://pierc.ac.in/" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-80">
                <PiercLogo className="h-6 w-auto" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
