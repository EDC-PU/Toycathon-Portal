
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

  const isProfileComplete = (profileData: any) => {
    return profileData && profileData.teamName && profileData.leaderPhone && profileData.college && profileData.instituteType && profileData.rollNumber && profileData.yearOfStudy && profileData.age && profileData.gender;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const tokenResult = await currentUser.getIdTokenResult();
        const userIsAdmin = !!tokenResult.claims.admin;
        setIsAdmin(userIsAdmin);
        setUser(currentUser);

        // Admins don't need to have a complete profile to access the dashboard
        if (!userIsAdmin) {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              if (!isProfileComplete(profileData)) {
                router.push('/profile');
              }
            } else {
              router.push('/profile');
            }
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
    return null; // or a redirect component
  }

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <DashboardSidebar isAdmin={isAdmin} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
