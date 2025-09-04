
"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Megaphone, Tag, Loader2, List, Shield } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface Stats {
    users: number;
    teams: number;
    submissions: number;
    announcements: number;
    categories: number;
    themes: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

     useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const usersCol = collection(db, "users");
            const teamsCol = collection(db, "teams");
            const submissionsCol = collection(db, "submissions");
            const announcementsCol = collection(db, "announcements");
            const categoriesCol = collection(db, "categories");
            const themesCol = collection(db, "themes");

            const [usersSnap, teamsSnap, submissionsSnap, announcementsSnap, categoriesSnap, themesSnap] = await Promise.all([
                getCountFromServer(usersCol),
                getCountFromServer(teamsCol),
                getCountFromServer(submissionsCol),
                getCountFromServer(announcementsCol),
                getCountFromServer(categoriesCol),
                getCountFromServer(themesCol)
            ]);

            setStats({
                users: usersSnap.data().count,
                teams: teamsSnap.data().count,
                submissions: submissionsSnap.data().count,
                announcements: announcementsSnap.data().count,
                categories: categoriesSnap.data().count,
                themes: themesSnap.data().count,
            });
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const chartData = stats ? [
        { name: "Users", total: stats.users },
        { name: "Teams", total: stats.teams },
        { name: "Submissions", total: stats.submissions },
    ] : [];


    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="mr-2 h-8 w-8 animate-spin" /> Loading Admin Dashboard...</div>;
    }

    if (!stats) {
        return <div className="flex h-full items-center justify-center">Could not load administrator statistics.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
                <p className="text-muted-foreground">Overview of the Toycathon event.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Teams Created</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.teams}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Idea Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.submissions}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.announcements}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.categories}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Themes</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.themes}</div>
                    </CardContent>
                </Card>
            </div>
            
             <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Registrations Overview</CardTitle>
                    <CardContent className="pl-2 pt-6">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                />
                                <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </CardHeader>
            </Card>

        </div>
    );
}
