"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface UserProfile {
    teamName: string;
    leaderName: string;
    leaderPhone: string;
    college: string;
    email: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const profileData = docSnap.data() as UserProfile;
                     if (profileData.teamName && profileData.leaderName && profileData.leaderPhone && profileData.college) {
                        setProfile(profileData);
                    } else {
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
        return <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center">Loading...</div>;
    }

    if (!profile) {
        return <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center">Redirecting...</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
             <div className="text-center mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Welcome, {profile.leaderName}!</h1>
                <p className="mt-2 text-muted-foreground">This is your dashboard. Here you can manage your team and submission.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Team: {profile.teamName}</CardTitle>
                        <CardDescription>College: {profile.college}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p><strong>Leader:</strong> {profile.leaderName}</p>
                        <p><strong>Email:</strong> {profile.email}</p>
                        <p><strong>Phone:</strong> {profile.leaderPhone}</p>
                         <Button asChild variant="outline" className="mt-4">
                            <Link href="/profile">Edit Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Submit Your Idea</CardTitle>
                        <CardDescription>Ready to submit your toy idea? Click below!</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                           The submission portal is not open yet. Check back later!
                        </p>
                        <Button disabled>
                           Go to Submission <ArrowRight className="ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
