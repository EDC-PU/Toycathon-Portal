
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

const announcementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
});

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: any;
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const tokenResult = await currentUser.getIdTokenResult();
                if (tokenResult.claims.admin) {
                    setIsAdmin(true);
                    fetchAnnouncements();
                } else {
                    router.push('/dashboard');
                }
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

    const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
        try {
            await addDoc(collection(db, "announcements"), {
                ...values,
                createdAt: serverTimestamp(),
            });
            toast({
                title: 'Announcement Posted!',
                description: 'Your announcement is now live for all participants.',
            });
            form.reset();
            fetchAnnouncements();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to post announcement.',
                variant: 'destructive',
            });
        }
    };
    
    const deleteAnnouncement = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await deleteDoc(doc(db, "announcements", id));
            toast({
                title: 'Announcement Deleted',
            });
            fetchAnnouncements();
        } catch (error) {
             toast({
                title: 'Error',
                description: 'Failed to delete announcement.',
                variant: 'destructive',
            });
        }
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Checking permissions...</div>;
    }
    
    if (!isAdmin) {
        return null;
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Announcements</h1>
                <p className="text-muted-foreground">Post and manage announcements for all participants.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Post a New Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Important Update" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Content</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Details about the announcement..." {...field} rows={5} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Announcement
                            </Button>
                        </form>
                    </Form>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Posted Announcements</CardTitle>
                    <CardDescription>The most recent announcements are shown first.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="p-4 rounded-lg border bg-secondary/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{ann.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {ann.createdAt?.toDate().toLocaleString()}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(ann.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                                <p className="mt-2 text-foreground">{ann.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>No announcements posted yet.</p>
                    )}
                </CardContent>
            </Card>

        </div>
    )
}
