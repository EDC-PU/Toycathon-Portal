
"use client";

import ProfileForm from '@/components/profile-form';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isProfileComplete = (profileData: any) => {
    // This check is now simplified as team creation is separate.
    // We just check for the user's own details.
    return profileData && profileData.leaderPhone && profileData.college && profileData.instituteType && profileData.rollNumber && profileData.yearOfStudy && profileData.age && profileData.gender;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
             // If user has a teamId, they are a member, not a leader who can create teams.
             // Their profile is considered complete for dashboard access.
            if (docSnap.exists() && (isProfileComplete(docSnap.data()) || docSnap.data().teamId)) {
                router.push('/dashboard');
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Complete Your Profile</h1>
        <p className="mt-2 text-muted-foreground">Tell us more about yourself to access the dashboard.</p>
      </div>
      <ProfileForm onProfileComplete={() => router.push('/dashboard')} />
    </div>
  );
}
