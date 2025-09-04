
"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Users, Megaphone, PlusCircle, CalendarDays, Video, Phone, Mail, Pin } from 'lucide-react';

interface UserProfile {
    displayName: string;
    email: string;
    uid: string;
    instituteType?: 'school' | 'university';
    isAdmin?: boolean;
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
                const tokenResult = await currentUser.getIdTokenResult();
                const userIsAdmin = !!tokenResult.claims.admin;

                // If user is admin, they should be on the admin page.
                if (userIsAdmin) {
                    router.push('/dashboard/admin');
                    return;
                }

                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ ...docSnap.data(), isAdmin: userIsAdmin } as UserProfile);
                } else {
                     router.push('/profile'); // if no profile, force creation
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
        // This case should ideally not be hit if the user is logged in and not an admin
        return <div className="flex h-screen items-center justify-center">Could not load profile information. Redirecting...</div>;
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

            {profile.instituteType === 'school' && (
                 <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-primary">
                            <CalendarDays />
                            School Team Schedule
                        </CardTitle>
                        <CardDescription>
                            Important dates and links for Phase 1 & 2.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <h4 className="font-semibold">Phase 1 & 2 Dates</h4>
                            <p className="text-muted-foreground">October 2nd, 3rd, and 4th</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Conduction Medium</h4>
                             <div className="flex items-center gap-2 text-muted-foreground">
                                <Video className="h-4 w-4" />
                                <span>Google Meet</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

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

             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Need help? Reach out to the event organizers.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2 text-primary">For any Query</h4>
                        <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>Manish Jain - 9131445130</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>Kartik Ram - 9594355271</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>Smitha Reddy - 8121734431</span>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 text-primary">Reach out to us</h4>
                        <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <Pin className="h-4 w-4 mt-1 flex-shrink-0" />
                                <span>
                                    Parul Innovation and Entrepreneurship Research Centre
                                    <br />
                                    BBA building, ground floor, Parul University 
                                    <br />
                                    P.O. Limda, Ta. Waghodia, Dist. Vadodara-391760
                                    <br/>
                                    Gujarat State, India.
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a href="mailto:pierc@paruluniversity.ac.in" className="hover:text-primary">pierc@paruluniversity.ac.in</a>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
