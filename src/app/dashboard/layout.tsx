
'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/components/dashboard-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const isProfileSufficient = (profileData: any) => {
    return !!profileData;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        const userIsAdmin = !!tokenResult.claims.admin;
        setIsAdmin(userIsAdmin);
        setUser(currentUser);

        if (userIsAdmin) {
           setLoading(false);
           return;
        }

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          if (!isProfileSufficient(profileData)) {
             router.push('/profile');
          }
        } else {
          router.push('/profile');
        }

      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Redirect is handled by the effect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/20">
      <DashboardSidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
