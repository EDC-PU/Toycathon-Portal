
"use client";

import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, DocumentData, deleteDoc, writeBatch, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Copy, PlusCircle, Users, Tag, Trash2, Edit, Mail, Phone } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Team extends DocumentData {
    id: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    teamId: string;
    creatorUid: string;
}

interface TeamMember {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

interface UserProfile {
    teamId?: string;
    [key: string]: any;
}


export default function TeamPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [createdTeams, setCreatedTeams] = useState<Team[]>([]);
    const [joinedTeam, setJoinedTeam] = useState<Team | null>(null);
    const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
    const [loading, setLoading] = useState(true);

    const deadline = new Date('2025-09-30T23:59:59');
    const canEdit = new Date() < deadline;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchData(currentUser.uid);
            } else {
                 setLoading(false);
            }
           
        });

        return () => unsubscribe();
    }, []);

    const fetchData = async (uid: string) => {
        setLoading(true);
        try {
            // 1. Fetch user profile
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);
            const profile = userDocSnap.exists() ? userDocSnap.data() as UserProfile : null;
            setUserProfile(profile);

            // 2. Fetch teams created by the user
            const createdTeamsQuery = query(collection(db, "teams"), where("creatorUid", "==", uid));
            const createdTeamsSnapshot = await getDocs(createdTeamsQuery);
            const fetchedCreatedTeams = createdTeamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            setCreatedTeams(fetchedCreatedTeams);

            // 3. If user has a teamId, fetch that team's details (if they didn't create it)
            let finalJoinedTeam = null;
            if (profile?.teamId) {
                const joinedTeamRef = doc(db, "teams", profile.teamId);
                const joinedTeamSnap = await getDoc(joinedTeamRef);
                if (joinedTeamSnap.exists()) {
                    finalJoinedTeam = { id: joinedTeamSnap.id, ...joinedTeamSnap.data() } as Team;
                    setJoinedTeam(finalJoinedTeam);
                }
            }
            
            // 4. Fetch members for all relevant teams
            const allTeams = [...fetchedCreatedTeams];
            if (finalJoinedTeam && !allTeams.some(t => t.id === finalJoinedTeam!.id)) {
                 allTeams.push(finalJoinedTeam);
            }
            
            const membersMap: { [key: string]: TeamMember[] } = {};
            for (const team of allTeams) {
                const membersQuery = query(collection(db, "users"), where("teamId", "==", team.id));
                const membersSnapshot = await getDocs(membersQuery);
                membersMap[team.id] = membersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() as TeamMember }));
            }
            setTeamMembers(membersMap);

        } catch (error) {
            console.error("Error fetching teams data:", error);
            toast({ title: "Error", description: "There was a problem loading team data. Please try again later.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    const removeMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this member from the team?")) return;

        try {
            const memberDocRef = doc(db, 'users', memberId);
            await updateDoc(memberDocRef, { teamId: null });
            toast({ title: "Member Removed", description: "The member has been successfully removed from the team." });
            if (user) fetchData(user.uid);
        } catch (error) {
            console.error("Error removing member:", error);
            toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
        }
    }

    const deleteTeam = async (team: Team) => {
        if (!confirm(`Are you sure you want to delete the team "${team.teamName}"? This action cannot be undone and will unlink all members.`)) return;

        setLoading(true);
        try {
            const teamRef = doc(db, "teams", team.id);
            const members = teamMembers[team.id] || [];
            const batch = writeBatch(db);

            members.forEach(member => {
                const memberRef = doc(db, "users", member.uid);
                batch.update(memberRef, { teamId: null });
            });
            batch.delete(teamRef);

            await batch.commit();
            
            toast({
                title: "Team Deleted",
                description: `"${team.teamName}" and all its members have been unlinked.`,
            });

            if(user) {
                fetchData(user.uid);
            }

        } catch (error) {
            console.error("Error deleting team:", error);
            toast({ title: "Error", description: "Failed to delete team.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }


    const getJoiningLink = (teamId: string) => {
        if (!teamId) return '';
        const origin = 'https://toycathon.pierc.org';
        return `${origin}/join/${teamId}`;
    };

     const copyJoiningLink = (teamId: string) => {
        const link = getJoiningLink(teamId);
        navigator.clipboard.writeText(link);
        toast({
            title: 'Copied to clipboard!',
            description: 'You can now share the link with the team members.'
        });
    }

     const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading your team information...</div>;
    }

    const hasNoTeam = createdTeams.length === 0 && !joinedTeam;
    const isOnlyMember = joinedTeam && createdTeams.length === 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Your Team</h1>
                    <p className="text-muted-foreground">{isOnlyMember ? "View your team details and members." : "View your created teams and invite members."}</p>
                </div>
                {!userProfile?.teamId && (
                    <Button asChild>
                        <Link href="/dashboard/teams/create">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
                        </Link>
                    </Button>
                )}
            </div>
            
            {hasNoTeam ? (
                <Card className="text-center p-8 border-dashed">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">You are not part of any team yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new team or join one with an invite link.</p>
                     <Button asChild className="mt-4">
                         <Link href="/dashboard/teams/create">Create New Team</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-8">
                    {(isOnlyMember ? [joinedTeam] : createdTeams).map(team => team && (
                        <Card key={team.id}>
                            <CardHeader className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center flex-wrap gap-4">
                                        <span className="text-primary">{team.teamName}</span>
                                         <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                            <Tag className="h-4 w-4" />
                                            <span>{team.teamId}</span>
                                         </div>
                                    </CardTitle>
                                    <CardDescription>Members Joined: {teamMembers[team.id]?.length || 0} / 4</CardDescription>
                                    
                                    <div className="mt-3 text-sm space-y-2 text-muted-foreground">
                                        <p><span className="font-semibold text-foreground">Leader:</span> {team.leaderName}</p>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4"/>
                                                <a href={`mailto:${team.leaderEmail}`} className="hover:text-primary">{team.leaderEmail}</a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4"/>
                                                <span>{team.leaderPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {user?.uid === team.creatorUid && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                     <Button asChild variant="outline" size="icon" disabled={!canEdit} title={canEdit ? 'Edit Team' : 'Editing is disabled after the deadline'}>
                                        <Link href={`/dashboard/teams/edit/${team.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => deleteTeam(team)} disabled={loading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {teamMembers[team.id]?.length > 0 ? (
                                    <div className="space-y-4">
                                    {teamMembers[team.id].map(member => (
                                        <div key={member.uid} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={member.photoURL || undefined} alt={member.displayName} />
                                                    <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{member.displayName}</p>
                                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                                </div>
                                            </div>
                                            {user?.uid === team.creatorUid && user?.uid !== member.uid && (
                                                <Button variant="ghost" size="icon" onClick={() => removeMember(member.uid)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-center py-4 text-muted-foreground">No members have joined this team yet. Share the link below!</p>
                                )}
                            </CardContent>
                            {user?.uid === team.creatorUid && (
                             <CardFooter className="flex-col sm:flex-row items-center gap-4 border-t pt-6 bg-secondary/20 rounded-b-lg">
                                <Input type="text" readOnly value={getJoiningLink(team.id)} aria-label="Team joining link" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                                <Button onClick={() => copyJoiningLink(team.id)} className="w-full sm:w-auto flex-shrink-0">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Joining Link
                                </Button>
                            </CardFooter>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
