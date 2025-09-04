
"use client";

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, DocumentData, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Search, XCircle, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';


interface PortalUser extends DocumentData {
    id: string;
    displayName: string;
    email: string;
    instituteType: 'school' | 'university';
    college: string;
    isAdmin: boolean;
}

export default function AdminUsersPage() {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<PortalUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if(user){
                fetchUsers();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "users"), orderBy("displayName"));
            const querySnapshot = await getDocs(q);
            const fetchedUsers = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, isAdmin: !!data.isAdmin, ...data } as PortalUser
            });
             setUsers(fetchedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const toggleAdminStatus = async (targetUser: PortalUser) => {
        if (!currentUser || currentUser.uid === targetUser.id) {
            toast({ title: 'Action not allowed', description: 'Admins cannot change their own status.', variant: 'destructive'});
            return;
        }

        const newAdminStatus = !targetUser.isAdmin;
        setUpdating(targetUser.id);
        try {
            const userDocRef = doc(db, 'users', targetUser.id);
            await updateDoc(userDocRef, { isAdmin: newAdminStatus });

            toast({
                title: 'Success',
                description: `${targetUser.displayName} is now ${newAdminStatus ? 'an admin' : 'a regular user'}. The user must log out and log back in for the change to take full effect.`,
            });
            
            setUsers(prevUsers => prevUsers.map(u => u.id === targetUser.id ? {...u, isAdmin: newAdminStatus} : u));

        } catch(error) {
            console.error("Error toggling admin status:", error);
            toast({ title: 'Error', description: 'Could not update user role.', variant: 'destructive' });
        } finally {
            setUpdating(null);
        }
    };

    const deleteUser = async (targetUser: PortalUser) => {
        if (!currentUser || currentUser.uid === targetUser.id) {
            toast({ title: 'Action not allowed', description: 'Admins cannot delete their own account.', variant: 'destructive'});
            return;
        }
        if (!confirm(`Are you sure you want to delete the user "${targetUser.displayName}"? This action cannot be undone.`)) return;

        setUpdating(targetUser.id);
        try {
            await deleteDoc(doc(db, "users", targetUser.id));
            
            toast({
                title: "User Deleted",
                description: `"${targetUser.displayName}" has been successfully deleted from the portal records.`,
            });

            setUsers(prevUsers => prevUsers.filter(u => u.id !== targetUser.id));

        } catch (error) {
            console.error("Error deleting user:", error);
            toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
        } finally {
            setUpdating(null);
        }
    }

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.college && u.college.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Fetching all users...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Manage Users</h1>
                <p className="text-muted-foreground">View, manage roles, and delete users from the portal.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Users</CardTitle>
                    <CardDescription>Found {filteredUsers.length} out of {users.length} total users.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Filter by name, email, or institute..." 
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
                                    <TableHead>User</TableHead>
                                    <TableHead>Institute</TableHead>
                                    <TableHead className="text-center">Admin</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                    <TableRow key={u.id} className={updating === u.id ? 'opacity-50' : ''}>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                {u.displayName} {u.id === currentUser?.uid && <Crown className="h-4 w-4 text-amber-500" />}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{u.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{u.college}</div>
                                            <div className="text-sm text-muted-foreground capitalize">{u.instituteType}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch 
                                                checked={u.isAdmin}
                                                onCheckedChange={() => toggleAdminStatus(u)}
                                                disabled={u.id === currentUser?.uid || updating === u.id}
                                                aria-label={`Toggle admin status for ${u.displayName}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="destructive" 
                                                size="icon" 
                                                onClick={() => deleteUser(u)} 
                                                disabled={u.id === currentUser?.uid || updating === u.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">
                       Admin role changes require the user to log out and log back in to take effect. User deletion is permanent.
                    </p>
                </CardFooter>
            </Card>

        </div>
    )
}
