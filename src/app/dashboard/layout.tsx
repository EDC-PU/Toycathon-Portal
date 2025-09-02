
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

  // Simplified profile check. We primarily care that they have a document.
  // Teachers might not have student-specific fields but can access the dashboard.
  // Students joining a team will be forced to the profile page until complete.
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

        // Admins can always access the dashboard
        if (userIsAdmin) {
           setLoading(false);
           return;
        }

        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data();
          // If profile is sufficient (i.e., exists), they can access the dashboard.
          // The profile page itself handles redirection if they need to fill more details.
          if (!isProfileSufficient(profileData)) {
             router.push('/profile');
          }
        } else {
          // If no user document exists at all, they must create it.
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
    <div className="flex min-h-screen bg-secondary/20">
      <DashboardSidebar isAdmin={isAdmin} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
