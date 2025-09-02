
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, runTransaction } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect } from 'react';
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const createTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  instituteType: z.enum(["SCHOOL", "UNIVERSITY"], { required_error: "Please select an institute type." }),
  leaderName: z.string().min(2, "Leader's name must be at least 2 characters."),
  leaderEmail: z.string().email("Please enter a valid email for the team leader."),
  leaderPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
});

export default function CreateTeamPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof createTeamSchema>>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            teamName: "",
            leaderName: "",
            leaderEmail: "",
            leaderPhone: "",
        },
    });

     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const onSubmit = async (values: z.infer<typeof createTeamSchema>) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to create a team.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const counterRef = doc(db, "counters", "teamIds");
            const teamsCollectionRef = collection(db, "teams");

            // Run a transaction to atomically get the next team ID
            const newTeamRef = await runTransaction(db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                
                const instituteTypeKey = values.instituteType.toLowerCase();
                let newCount = 1;

                if (counterDoc.exists()) {
                    newCount = (counterDoc.data()[instituteTypeKey] || 0) + 1;
                }
                
                const paddedCount = String(newCount).padStart(3, '0');
                const teamId = `VT/${values.instituteType}/${paddedCount}`;

                transaction.set(counterRef, { [instituteTypeKey]: newCount }, { merge: true });
                
                const newTeamDocRef = doc(teamsCollectionRef);
                transaction.set(newTeamDocRef, {
                    ...values,
                    teamId: teamId,
                    creatorUid: user.uid,
                    createdAt: serverTimestamp(),
                });

                return newTeamDocRef;
            });

            toast({
                title: 'Team Created!',
                description: 'The team has been successfully created. You can now invite members.',
            });
            router.push('/dashboard/teams');

        } catch (error) {
            console.error("Error creating team:", error);
            toast({
                title: 'Error',
                description: 'Failed to create the team. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Create a New Team</h1>
                <p className="text-muted-foreground">Fill out the form below to register a new team for the Toycathon.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Team Information</CardTitle>
                    <CardDescription>Enter the details for the team and its leader.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="teamName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., The Innovators" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="instituteType"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Team's Institute Type</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="SCHOOL" />
                                        </FormControl>
                                        <FormLabel className="font-normal">School</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="UNIVERSITY" />
                                        </FormControl>
                                        <FormLabel className="font-normal">University</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <div className="border-t pt-6 space-y-6">
                                <h3 className="text-lg font-medium text-foreground">Team Leader&apos;s Details</h3>
                                <FormField
                                    control={form.control}
                                    name="leaderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Student's full name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="leaderEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="student.email@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="leaderPhone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                </div>
                             </div>
                            <Button type="submit" disabled={isLoading || !user}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Team
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
    )
}

    