
"use client";

import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, DocumentData, doc, deleteDoc, where, writeBatch, deleteField } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Edit, Search, XCircle, Eye, Users, FileDown } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface Team extends DocumentData {
    id: string;
    teamName: string;
    leaderName: string;
    leaderEmail: string;
    leaderPhone: string;
    teamId: string;
    instituteName: string;
    creatorUid: string;
    memberCount?: number;
}

interface TeamMember {
    uid: string;
    displayName: string;
    email: string;
    leaderPhone: string;
    college: string;
    yearOfStudy: string;
    rollNumber: string;
}

export default function AdminTeamsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);
    
    const fetchTeams = async () => {
        setLoading(true);
        try {
            const teamsQuery = query(collection(db, "teams"), orderBy("createdAt", "desc"));
            const teamsSnapshot = await getDocs(teamsQuery);
            const fetchedTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

            const teamsWithCounts = await Promise.all(fetchedTeams.map(async (team) => {
                const membersQuery = query(collection(db, "users"), where("teamId", "==", team.id));
                const membersSnapshot = await getDocs(membersQuery);
                return { ...team, memberCount: membersSnapshot.size };
            }));

            setTeams(teamsWithCounts);
        } catch (error) {
            console.error("Error fetching teams:", error);
            toast({ title: 'Error', description: 'Failed to fetch teams.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const deleteTeam = async (team: Team) => {
        if (!confirm(`Are you sure you want to delete the team "${team.teamName}"? This action cannot be undone and will unlink all members.`)) return;

        setLoading(true);
        try {
            const teamRef = doc(db, "teams", team.id);
            
            const membersQuery = query(collection(db, "users"), where("teamId", "==", team.id));
            const membersSnapshot = await getDocs(membersQuery);
            const members = membersSnapshot.docs.map(doc => ({ uid: doc.id } as { uid: string }));
            
            const batch = writeBatch(db);

            members.forEach(member => {
                const memberRef = doc(db, "users", member.uid);
                batch.update(memberRef, { teamId: deleteField() });
            });
            batch.delete(teamRef);

            await batch.commit();
            
            toast({
                title: "Team Deleted",
                description: `"${team.teamName}" and all its members have been unlinked.`,
            });

            fetchTeams();

        } catch (error) {
            console.error("Error deleting team:", error);
            toast({ title: "Error", description: "Failed to delete team.", variant: "destructive" });
        } finally {
            setLoading(false);
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
    
    const handleExport = async () => {
        setExporting(true);
        toast({ title: "Exporting...", description: "Preparing team and member data for export." });

        try {
            const dataToExport = [];

            for (const team of filteredTeams) {
                const membersQuery = query(collection(db, "users"), where("teamId", "==", team.id));
                const membersSnapshot = await getDocs(membersQuery);
                const members = membersSnapshot.docs.map(doc => ({ ...doc.data() } as TeamMember));

                if (members.length === 0) {
                     dataToExport.push({
                        'Team Name': team.teamName,
                        'Team ID': team.teamId,
                        'Team Institute': team.instituteName,
                        'Role': 'Leader',
                        'Member Name': team.leaderName,
                        'Member Email': team.leaderEmail,
                        'Member Phone': team.leaderPhone,
                        'Member Institute': team.instituteName,
                        'Year of Study': 'N/A',
                        'Roll Number': 'N/A',
                    });
                } else {
                    for (const member of members) {
                         dataToExport.push({
                            'Team Name': team.teamName,
                            'Team ID': team.teamId,
                            'Team Institute': team.instituteName,
                            'Role': member.uid === team.creatorUid ? 'Leader' : 'Member',
                            'Member Name': member.displayName,
                            'Member Email': member.email,
                            'Member Phone': member.leaderPhone,
                            'Member Institute': member.college,
                            'Year of Study': member.yearOfStudy,
                            'Roll Number': member.rollNumber,
                        });
                    }
                }
            }
            
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "TeamsWithMembers");
            XLSX.writeFile(workbook, "ToycathonTeams_Detailed.xlsx");

            toast({ title: "Export Complete!", description: "The detailed team and member list has been downloaded." });

        } catch (error) {
            console.error("Error exporting data:", error);
            toast({ title: 'Export Failed', description: 'Could not generate the Excel file.', variant: 'destructive' });
        } finally {
            setExporting(false);
        }
    };


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
                     <div className="flex items-center gap-4">
                        <div className="relative flex-grow">
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
                         <Button onClick={handleExport} disabled={filteredTeams.length === 0 || exporting}>
                            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                            Export to Excel
                        </Button>
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
                                    <TableHead>Members</TableHead>
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
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{team.memberCount} / 4</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/admin/teams/view/${team.id}`}><Eye className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/admin/teams/edit/${team.id}`}><Edit className="h-4 w-4" /></Link>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => deleteTeam(team)} disabled={loading}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">
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

    