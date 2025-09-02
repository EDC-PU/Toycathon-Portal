
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
import { Loader2 } from 'lucide-react';
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc, collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";


const submissionSchema = z.object({
  teamId: z.string({ required_error: "Please select a team." }),
  ideaTitle: z.string().min(5, "Title must be at least 5 characters."),
  ideaDescription: z.string().min(20, "Description must be at least 20 characters."),
  videoLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

interface Team extends DocumentData {
    id: string;
    teamName: string;
    teamId: string;
}

export default function SubmissionPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isFetchingTeams, setIsFetchingTeams] = useState(true);


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
                setIsFetchingTeams(true);
                const teamsQuery = query(collection(db, "teams"), where("creatorUid", "==", currentUser.uid));
                const teamsSnapshot = await getDocs(teamsQuery);
                const fetchedTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
                setTeams(fetchedTeams);
                
                if (fetchedTeams.length === 1) {
                    form.setValue("teamId", fetchedTeams[0].id);
                }
                
                setIsFetchingTeams(false);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, form]);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (selectedTeamId) {
                const submissionDocRef = doc(db, "submissions", selectedTeamId);
                const submissionDocSnap = await getDoc(submissionDocRef);
                if (submissionDocSnap.exists()) {
                    form.reset(submissionDocSnap.data());
                } else {
                    form.reset({
                        teamId: selectedTeamId,
                        ideaTitle: "",
                        ideaDescription: "",
                        videoLink: "",
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

        setIsLoading(true);
        try {
            // Use the selected team's firestore ID as the document ID in submissions
            const submissionRef = doc(db, "submissions", values.teamId); 
            await setDoc(submissionRef, {
                ...values,
                userId: user.uid, // Keep track of who submitted
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

    if (isFetchingTeams) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Fetching your teams...</div>;
    }
    
    if (teams.length === 0) {
        return (
             <div className="space-y-8 text-center flex flex-col items-center justify-center h-full">
                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-primary">No Teams Found</CardTitle>
                        <CardDescription>
                            You need to create a team before you can submit an idea.
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
