
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Users, User, Phone, Mail, GraduationCap, Building, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface Team extends DocumentData {
    id: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    teamId: string;
    instituteName: string;
    instituteType: string;
}

interface Member extends DocumentData {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    college: string;
    yearOfStudy: string;
    leaderPhone: string;
}

export default function ViewTeamPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.id as string;
    
    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!teamId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch team details
                const teamDocRef = doc(db, "teams", teamId);
                const teamDocSnap = await getDoc(teamDocRef);

                if (!teamDocSnap.exists()) {
                    setError("Team not found.");
                    setLoading(false);
                    return;
                }
                const teamData = { id: teamDocSnap.id, ...teamDocSnap.data() } as Team;
                setTeam(teamData);

                // Fetch team members
                const membersQuery = query(collection(db, "users"), where("teamId", "==", teamId));
                const membersSnapshot = await getDocs(membersQuery);
                const fetchedMembers = membersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Member));
                setMembers(fetchedMembers);

            } catch (err) {
                console.error("Error fetching team data:", err);
                setError("Failed to fetch team data. Check permissions and network.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamId]);

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading team details...</div>;
    }

    if (error) {
         return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Team Details</h1>
                    <p className="text-muted-foreground">Viewing details for {team?.teamName}.</p>
                </div>
            </div>

            {team && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary">{team.teamName}</CardTitle>
                        <CardDescription>
                            <span className="font-mono text-xs bg-secondary px-2 py-1 rounded-md">{team.teamId}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Institute</p>
                                    <p className="text-muted-foreground">{team.instituteName} ({team.instituteType})</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Team Leader</p>
                                    <p className="text-muted-foreground">{team.leaderName}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Leader's Email</p>
                                    <p className="text-muted-foreground">{team.leaderEmail}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Leader's Phone</p>
                                    <p className="text-muted-foreground">{team.leaderPhone}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        Team Members ({members.length})
                    </CardTitle>
                    <CardDescription>All members registered under this team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {members.length > 0 ? (
                        members.map(member => (
                            <div key={member.uid}>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={member.photoURL} alt={member.displayName} />
                                        <AvatarFallback>{getInitials(member.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-bold text-lg">{member.displayName}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
                                             <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {member.email}</p>
                                             <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {member.leaderPhone}</p>
                                             <p className="flex items-center gap-2"><Building className="h-4 w-4" /> {member.college}</p>
                                             <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> {member.yearOfStudy}</p>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-4" />
                           </div>
                        ))
                    ) : (
                        <p>No members found for this team.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
