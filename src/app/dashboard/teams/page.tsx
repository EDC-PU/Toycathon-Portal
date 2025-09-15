
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
import { Copy, PlusCircle, Users, Tag, Trash2, Edit } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Team extends DocumentData {
    id: string;
    teamName: string;
    leaderName: string;
    teamId: string; // The new serial team ID
    creatorUid: string;
}

interface TeamMember {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
}

export default function TeamPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
    const [loading, setLoading] = useState(true);

    const deadline = new Date('2025-09-30T23:59:59');
    const canEdit = new Date() < deadline;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchTeams(currentUser.uid);
            } else {
                 setLoading(false);
            }
           
        });

        return () => unsubscribe();
    }, []);

    const fetchTeams = async (creatorId: string) => {
        setLoading(true);
        try {
            const q = query(collection(db, "teams"), where("creatorUid", "==", creatorId));
            const querySnapshot = await getDocs(q);
            const fetchedTeams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            setTeams(fetchedTeams);

            const membersMap: { [key: string]: TeamMember[] } = {};
            for (const team of fetchedTeams) {
                const membersQuery = query(collection(db, "users"), where("teamId", "==", team.id));
                const membersSnapshot = await getDocs(membersQuery);
                membersMap[team.id] = membersSnapshot.docs.map(doc => doc.data() as TeamMember);
            }
            setTeamMembers(membersMap);
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast({ title: "Error", description: "There was a problem loading your teams. Please try again later.", variant: "destructive" });
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
            if (user) fetchTeams(user.uid);
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
                fetchTeams(user.uid);
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
        return `${origin}?teamId=${teamId}`;
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
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading your teams...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Your Teams</h1>
                    <p className="text-muted-foreground">View your created teams and invite members.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/teams/create">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
                    </Link>
                </Button>
            </div>
            
            {teams.length === 0 ? (
                <Card className="text-center p-8 border-dashed">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No teams created yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new team for your students.</p>
                    <Button asChild className="mt-4">
                         <Link href="/dashboard/teams/create">Create New Team</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-8">
                    {teams.map(team => (
                        <Card key={team.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-4">
                                        <span className="text-primary">{team.teamName}</span>
                                         <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                            <Tag className="h-4 w-4" />
                                            <span>{team.teamId}</span>
                                         </div>
                                    </CardTitle>
                                    <CardDescription>Leader: {team.leaderName} | Members Joined: {teamMembers[team.id]?.length || 0} / 4</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button asChild variant="outline" size="icon" disabled={!canEdit} title={canEdit ? 'Edit Team' : 'Editing is disabled after the deadline'}>
                                        <Link href={`/dashboard/teams/edit/${team.id}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => deleteTeam(team)} disabled={loading}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
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
                             <CardFooter className="flex-col sm:flex-row items-center gap-4 border-t pt-6 bg-secondary/20 rounded-b-lg">
                                <Input type="text" readOnly value={getJoiningLink(team.id)} aria-label="Team joining link" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
                                <Button onClick={() => copyJoiningLink(team.id)} className="w-full sm:w-auto flex-shrink-0">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Joining Link
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
