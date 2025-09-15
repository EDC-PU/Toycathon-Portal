
"use client";

import ProfileForm from '@/components/profile-form';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState, Suspense } from 'react';
import type { User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const joinToken = searchParams.get('joinToken');

  const isProfileComplete = (profileData: any) => {
    return profileData && profileData.leaderPhone && profileData.college && profileData.instituteType && profileData.rollNumber && profileData.yearOfStudy && profileData.age && profileData.gender;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && isProfileComplete(docSnap.data()) && !joinToken) {
                router.push('/dashboard');
            }
        } else {
            const redirectPath = joinToken ? `/join/${joinToken}` : '/login';
            router.push(redirectPath);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, [router, joinToken]);

  const handleProfileComplete = () => {
    if (joinToken) {
        router.push(`/join/${joinToken}`);
    } else {
        router.push('/dashboard');
    }
  }

  if (loading || !user) {
    return <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /> Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Complete Your Profile</h1>
        <p className="mt-2 text-muted-foreground">Tell us more about yourself to access the dashboard.</p>
      </div>
      <ProfileForm onProfileComplete={handleProfileComplete} />
    </div>
  );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ProfilePageContent />
        </Suspense>
    )
}
