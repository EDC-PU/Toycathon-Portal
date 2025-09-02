
"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Users, Megaphone, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    displayName: string;
    email: string;
    uid: string;
    // Add other fields from your user profile if needed
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: any;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data() as UserProfile);
                }
                fetchAnnouncements();
            } else {
                 router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const fetchAnnouncements = async () => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedAnnouncements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(fetchedAnnouncements);
    }


    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!profile) {
        return <div className="flex h-screen items-center justify-center">Could not load profile. Please complete your profile.</div>;
    }


    return (
        <div className="space-y-8">
             <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome, {profile.displayName}!</h1>
                <p className="mt-2 text-muted-foreground">This is your command center for the Toycathon.</p>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Megaphone className="w-8 h-8 text-primary"/>
                    <div>
                        <CardTitle>Announcements</CardTitle>
                        <CardDescription>Latest updates from the Toycathon organizers.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 max-h-64 overflow-y-auto">
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="p-3 rounded-lg bg-secondary/50">
                                <h3 className="font-bold">{ann.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {ann.createdAt?.toDate().toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-sm">{ann.content}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">No new announcements right now. Check back later!</p>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Your Profile Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="font-semibold">Profile Complete</p>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href="/dashboard/profile">View/Edit Profile</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Idea Submission</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                       <Clock className="h-10 w-10 text-yellow-500" />
                       <div>
                            <p className="font-semibold">Open</p>
                            <p className="text-sm text-muted-foreground">The portal is now open.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Teams</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Users className="h-10 w-10 text-primary" />
                        <div>
                           <p className="font-semibold">Create & View Teams</p>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href="/dashboard/teams">Go to Teams</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Create a New Team</CardTitle>
                    <CardDescription>Click here to register a new team for the competition.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                       <Link href="/dashboard/teams/create">
                            <PlusCircle className="mr-2" /> Create Team
                       </Link>
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Submit Your Idea</CardTitle>
                    <CardDescription>Ready to submit your toy idea? The portal is open!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                       <Link href="/dashboard/submission">
                            Go to Submission <ArrowRight className="ml-2" />
                       </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
