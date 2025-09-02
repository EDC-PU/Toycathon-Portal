
"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Copy, Users, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    teamName: string;
    leaderName: string;
    leaderPhone: string;
    college: string;
    email: string;
    uid: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: any;
}

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();
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
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchAnnouncements = async () => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedAnnouncements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(fetchedAnnouncements);
    }

    const getJoiningLink = () => {
        if (!profile) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/register?teamId=${profile.uid}`;
    };

    const copyJoiningLink = () => {
        const link = getJoiningLink();
        navigator.clipboard.writeText(link);
        toast({
            title: 'Copied to clipboard!',
            description: 'You can now share the link with your team members.'
        });
    }

    if (loading) {
        return <div className="flex items-center justify-center">Loading...</div>;
    }

    if (!profile) {
        return <div className="flex items-center justify-center">Could not load profile.</div>;
    }


    return (
        <div className="space-y-8">
             <div className="text-left">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Welcome, {profile.leaderName}!</h1>
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
                        <CardTitle>Registration Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <div>
                            <p className="font-semibold">Registered</p>
                            <p className="text-sm text-muted-foreground">Your team is registered.</p>
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
                        <CardTitle>Team: {profile.teamName}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Users className="h-10 w-10 text-primary" />
                        <div>
                            <p className="font-semibold">{profile.college}</p>
                            <Button asChild variant="link" className="p-0 h-auto">
                                <Link href="/dashboard/team">Manage Team</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Invite Your Team</CardTitle>
                    <CardDescription>Share this link with your friends to have them join your team.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                    <input type="text" readOnly value={getJoiningLink()} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                    <Button onClick={copyJoiningLink} className="w-full sm:w-auto">
                        <Copy className="mr-2" />
                        Copy Link
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
