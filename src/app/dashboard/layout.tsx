
'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, runTransaction } from 'firebase/firestore';
import DashboardSidebar from '@/components/dashboard-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isProfileSufficient = (profileData: any) => {
    return profileData && (profileData.leaderPhone || profileData.teamId);
  };

  const handleJoinTeam = useCallback(async (teamIdToJoin: string, currentUser: User) => {
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            const userData = userDoc.data();

            if (userData?.teamId) {
                // User is already in a team, no need to do anything.
                toast({ title: "Already in a Team", description: "You are already a member of a team." });
                return;
            }

            const teamDocRef = doc(db, "teams", teamIdToJoin);
            const teamDoc = await transaction.get(teamDocRef);

            if (!teamDoc.exists()) {
                throw new Error("This team does not exist. Please check the joining link.");
            }

            // We need to query for members outside the transaction for it to work.
            const membersQuery = query(collection(db, "users"), where("teamId", "==", teamIdToJoin));
            const membersSnapshot = await getDocs(membersQuery);
            
            if (membersSnapshot.size >= 4) {
                throw new Error("This team is already full and cannot accept new members.");
            }

            transaction.update(userDocRef, { teamId: teamIdToJoin });
        });
         toast({ title: "Success!", description: "You have successfully joined the team." });
         // Re-fetch user profile or refresh page to update UI state
         router.refresh(); 
    } catch (error: any) {
        toast({ title: "Failed to Join Team", description: error.message, variant: "destructive" });
    } finally {
        // Remove teamId from URL after attempting to join
        router.replace(pathname, { scroll: false });
    }
  }, [toast, router, pathname]);

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
        const profileData = docSnap.exists() ? docSnap.data() : null;
        
        const userIsAdmin = profileData?.isAdmin === true;
        
        if (userIsAdmin) {
           router.push('/admin');
           return; 
        } else {
            setIsAdmin(false);
            
            const teamIdToJoin = searchParams.get('teamId');
            if (teamIdToJoin) {
                await handleJoinTeam(teamIdToJoin, currentUser);
                 // After handling, proceed with profile check
                const updatedDocSnap = await getDoc(docRef);
                const updatedProfileData = updatedDocSnap.data();
                 if (!isProfileSufficient(updatedProfileData)) {
                    router.push('/profile');
                    return;
                }
            } else if (!isProfileSufficient(profileData)) {
              router.push('/profile');
              return;
            }
        }

      } else {
        const teamId = searchParams.get('teamId');
        if (teamId) {
            router.push(`/register?teamId=${teamId}`);
        } else {
            router.push('/login');
        }
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, searchParams, handleJoinTeam]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading...
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


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading Dashboard...</div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
