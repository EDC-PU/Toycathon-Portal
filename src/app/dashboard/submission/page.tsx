
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, DocumentData, orderBy } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";


const submissionSchema = z.object({
  teamId: z.string({ required_error: "Please select a team." }),
  categoryId: z.string({ required_error: "Please select a category." }),
  themeId: z.string({ required_error: "Please select a theme." }),
  ideaTitle: z.string().min(5, "Title must be at least 5 characters."),
  ideaDescription: z.string().min(20, "Description must be at least 20 characters."),
  videoLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

interface Team extends DocumentData {
    id: string;
    teamName: string;
    teamId: string;
}

interface FirestoreDocument extends DocumentData {
    id: string;
    name: string;
}

export default function SubmissionPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [categories, setCategories] = useState<FirestoreDocument[]>([]);
    const [themes, setThemes] = useState<FirestoreDocument[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isLeader, setIsLeader] = useState(false);
    const [canSubmit, setCanSubmit] = useState(true);


    const form = useForm<z.infer<typeof submissionSchema>>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            ideaTitle: "",
            ideaDescription: "",
            videoLink: "",
        },
    });

    const selectedTeamId = form.watch("teamId");

     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setIsFetching(true);
                
                try {
                    const settingsDoc = await getDoc(doc(db, "settings", "config"));
                    if (settingsDoc.exists()) {
                        const deadline = settingsDoc.data().ideaSubmissionDeadline?.toDate();
                        if (deadline && new Date() > deadline) {
                            setCanSubmit(false);
                        }
                    }

                    const teamsQuery = query(collection(db, "teams"), where("creatorUid", "==", currentUser.uid));
                    const teamsSnapshot = await getDocs(teamsQuery);
                    
                    if (teamsSnapshot.empty) {
                        setIsLeader(false);
                    } else {
                        setIsLeader(true);
                    }

                    const fetchedTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
                    setTeams(fetchedTeams);
                    
                    if (fetchedTeams.length === 1) {
                        form.setValue("teamId", fetchedTeams[0].id);
                    }

                    const categoriesQuery = query(collection(db, "categories"), orderBy("name"));
                    const categoriesSnapshot = await getDocs(categoriesQuery);
                    setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDocument)));

                    const themesQuery = query(collection(db, "themes"), orderBy("name"));
                    const themesSnapshot = await getDocs(themesQuery);
                    setThemes(themesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDocument)));
                } catch (error) {
                    console.error("Error fetching initial data: ", error);
                    toast({ title: "Error", description: "Could not load submission data.", variant: "destructive"});
                } finally {
                    setIsFetching(false);
                }

            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, form, toast]);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (selectedTeamId) {
                const submissionDocRef = doc(db, "submissions", selectedTeamId);
                const submissionDocSnap = await getDoc(submissionDocRef);
                if (submissionDocSnap.exists()) {
                    form.reset(submissionDocSnap.data());
                } else {
                     // Keep teamId but reset the rest of the form
                    const currentTeamId = form.getValues("teamId");
                    form.reset({
                        teamId: currentTeamId,
                        ideaTitle: "",
                        ideaDescription: "",
                        videoLink: "",
                        categoryId: undefined,
                        themeId: undefined,
                    });
                }
            }
        };
        fetchSubmission();
    }, [selectedTeamId, form]);

    const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to submit.", variant: "destructive" });
            return;
        }

        if (!canSubmit) {
            toast({ title: "Deadline Passed", description: "The deadline for idea submissions has passed.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const submissionRef = doc(db, "submissions", values.teamId); 
            await setDoc(submissionRef, {
                ...values,
                userId: user.uid,
                submittedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: 'Idea Submitted!',
                description: 'Your idea has been successfully submitted for the selected team.',
            });
            router.push('/dashboard');

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit your idea. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Fetching data...</div>;
    }
    
     if (!canSubmit) {
        return (
             <div className="space-y-8 text-center flex flex-col items-center justify-center h-full">
                <Card className="max-w-lg border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Submissions Closed</CardTitle>
                        <CardDescription>
                            The deadline for submitting or editing ideas has passed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!isLeader) {
        return (
             <div className="space-y-8 text-center flex flex-col items-center justify-center h-full">
                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-primary">Create a Team to Submit</CardTitle>
                        <CardDescription>
                            Only team leaders can submit an idea. Please create a team first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/teams/create">Create a Team</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Submit Your Idea</h1>
                <p className="text-muted-foreground">Fill out the form below to submit your toy or game concept.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Idea Submission Form</CardTitle>
                    <CardDescription>Make sure your idea is well-described. You can edit your submission until the deadline.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="teamId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a team to submit for" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teams.map(team => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.teamName} ({team.teamId})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedTeamId || categories.length === 0}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="themeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Theme</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!selectedTeamId || themes.length === 0}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a theme" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {themes.map(theme => (
                                                        <SelectItem key={theme.id} value={theme.id}>
                                                            {theme.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>


                            <FormField
                                control={form.control}
                                name="ideaTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Idea Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Interactive Storytelling Blocks" {...field} disabled={!selectedTeamId} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ideaDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detailed Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe your toy idea in detail. What makes it unique?" {...field} rows={8} disabled={!selectedTeamId} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="videoLink"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concept Video Link (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://youtube.com/your-video" {...field} disabled={!selectedTeamId} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading || !selectedTeamId}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Idea
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
    )
}

    