
'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/components/dashboard-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        await currentUser.reload();
        if (!currentUser.emailVerified && currentUser.providerData.some(p => p.providerId === 'password')) {
          router.push('/verify-email');
          return;
        }
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        const userIsAdmin = docSnap.exists() && docSnap.data().isAdmin === true;
        
        if (userIsAdmin) {
            setIsAdmin(true);
        } else {
           router.push('/dashboard');
           return;
        }

      } else {
        router.push('/login');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Verifying admin access...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Redirects are handled by the effect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/20">
      <div className="hidden md:flex">
         <DashboardSidebar isAdmin={true} />
      </div>
       <div className="flex flex-1 flex-col overflow-hidden">
        <header className="md:hidden flex h-16 items-center justify-between border-b bg-background px-4">
            <Link href="/">
                <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={140} height={32} className="h-8 w-auto object-contain" />
            </Link>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                  <DashboardSidebar isAdmin={true} onLinkClick={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
