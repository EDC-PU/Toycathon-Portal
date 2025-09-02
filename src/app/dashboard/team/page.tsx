
"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, PlusCircle, Trash2 } from 'lucide-react';

interface TeamMember {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function TeamPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const teamId = userDocSnap.data().teamId || currentUser.uid;
                    setTeamId(teamId);
                    
                    const q = query(collection(db, "users"), where("teamId", "==", teamId));
                    const querySnapshot = await getDocs(q);
                    const members = querySnapshot.docs.map(doc => doc.data() as TeamMember);
                    setTeamMembers(members);
                }

            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getJoiningLink = () => {
        if (!teamId) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/register?teamId=${teamId}`;
    };

     const copyJoiningLink = () => {
        const link = getJoiningLink();
        navigator.clipboard.writeText(link);
        toast({
            title: 'Copied to clipboard!',
            description: 'You can now share the link with your team members.'
        });
    }

     const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <div>Loading team members...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Your Team</h1>
            <p className="text-muted-foreground mb-8">View your team members and invite new ones.</p>
            
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members ({teamMembers.length} / 5)</CardTitle>
                        <CardDescription>This is your current team.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {teamMembers.map(member => (
                            <div key={member.uid} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-4">
                                     <Avatar>
                                        <AvatarImage src={member.photoURL} alt={member.displayName} />
                                        <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{member.displayName} {member.uid === user?.uid && '(You)'}</p>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                </div>
                                {member.uid !== user?.uid && (
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Invite Members</CardTitle>
                        <CardDescription>Share the link below to invite members to your team.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                        <input type="text" readOnly value={getJoiningLink()} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                        <Button onClick={copyJoiningLink} className="w-full sm:w-auto">
                            <Copy className="mr-2" />
                            Copy Link
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
