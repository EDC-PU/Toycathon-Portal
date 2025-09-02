import Image from 'next/image';

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
                <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={140} height={32} className="h-8 w-auto object-contain" />
            </a>
            <a href="https://www.pierc.org/" target="_blank" rel="noopener noreferrer" className="text-foreground transition-opacity hover:opacity-80">
                <Image src="https://www.pierc.org/assets/PIERC.svg" alt="PIERC Logo" width={80} height={32} className="h-8 w-auto object-contain" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
