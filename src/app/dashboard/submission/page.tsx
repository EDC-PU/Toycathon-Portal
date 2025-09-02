
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
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";


const submissionSchema = z.object({
  ideaTitle: z.string().min(5, "Title must be at least 5 characters."),
  ideaDescription: z.string().min(20, "Description must be at least 20 characters."),
  videoLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export default function SubmissionPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof submissionSchema>>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            ideaTitle: "",
            ideaDescription: "",
            videoLink: "",
        },
    });

     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const submissionDocRef = doc(db, "submissions", currentUser.uid);
                const submissionDocSnap = await getDoc(submissionDocRef);
                if (submissionDocSnap.exists()) {
                    form.reset(submissionDocSnap.data());
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, form]);

    const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to submit.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const submissionRef = doc(db, "submissions", user.uid);
            await setDoc(submissionRef, {
                ...values,
                userId: user.uid,
                submittedAt: serverTimestamp(),
            }, { merge: true });

            toast({
                title: 'Idea Submitted!',
                description: 'Your idea has been successfully submitted.',
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
                                name="ideaTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Idea Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Interactive Storytelling Blocks" {...field} />
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
                                            <Textarea placeholder="Describe your toy idea in detail. What makes it unique?" {...field} rows={8} />
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
                                            <Input placeholder="https://youtube.com/your-video" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading}>
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
