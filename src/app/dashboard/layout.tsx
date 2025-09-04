
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isProfileSufficient = (profileData: any) => {
    return profileData && (profileData.leaderPhone || profileData.teamId);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        const userIsAdmin = docSnap.exists() && docSnap.data().isAdmin === true;
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
           // If an admin lands on the base participant dashboard, redirect them.
           // This check is now specific and will not affect any other admin routes.
           if (pathname === '/dashboard') {
              router.push('/dashboard/admin');
              return; // End execution to prevent rendering child
           }
        } else {
            // For regular users, check if their profile is complete.
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              if (!isProfileSufficient(profileData)) {
                router.push('/profile');
                return;
              }
            } else {
              // If no profile document exists at all, force creation.
              router.push('/profile');
              return;
            }
        }

      } else {
        router.push('/login');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by the effect.
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/20">
      <div className="hidden md:flex">
         <DashboardSidebar isAdmin={isAdmin} />
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
                  <DashboardSidebar isAdmin={isAdmin} onLinkClick={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
