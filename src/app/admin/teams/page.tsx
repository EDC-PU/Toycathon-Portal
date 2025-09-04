
"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, DocumentData, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Edit, Search, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Team extends DocumentData {
    id: string;
    teamName: string;
    leaderName: string;
    teamId: string;
    instituteName: string;
}

export default function AdminTeamsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);
    
    const fetchTeams = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedTeams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
            setTeams(fetchedTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast({ title: 'Error', description: 'Failed to fetch teams.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const deleteTeam = async (team: Team) => {
        if (!confirm(`Are you sure you want to delete the team "${team.teamName}"? This will unlink all its members.`)) return;

        try {
            const teamRef = doc(db, "teams", team.id);
            // In a real-world scenario, unlinking users might require a Cloud Function for security.
            // For this prototype, we'll just delete the team document.
            await deleteDoc(teamRef);
            
            toast({
                title: "Team Deleted",
                description: `"${team.teamName}" has been removed.`,
            });

            fetchTeams();

        } catch (error) {
            console.error("Error deleting team:", error);
            toast({ title: "Error", description: "Failed to delete team.", variant: "destructive" });
        }
    };

    const filteredTeams = useMemo(() => {
        return teams.filter(team => 
            team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            team.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (team.teamId && team.teamId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (team.instituteName && team.instituteName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [teams, searchTerm]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Fetching all teams...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Manage All Teams</h1>
                <p className="text-muted-foreground">View, edit, and delete any team in the portal.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Teams</CardTitle>
                    <CardDescription>Found {filteredTeams.length} out of {teams.length} total teams.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter by name, leader, ID, or institute..." 
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         {searchTerm && (
                            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchTerm('')}>
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Team Name</TableHead>
                                    <TableHead>Team ID</TableHead>
                                    <TableHead>Leader Name</TableHead>
                                    <TableHead>Institute</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeams.length > 0 ? filteredTeams.map(team => (
                                    <TableRow key={team.id}>
                                        <TableCell className="font-medium">{team.teamName}</TableCell>
                                        <TableCell>{team.teamId || 'N/A'}</TableCell>
                                        <TableCell>{team.leaderName}</TableCell>
                                        <TableCell>{team.instituteName}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/admin/teams/edit/${team.id}`}><Edit className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => deleteTeam(team)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No teams found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">
                        Admins can edit or delete teams at any time. These actions are permanent.
                    </p>
                </CardFooter>
            </Card>

        </div>
    )
}
