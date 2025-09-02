
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
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter, useParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


const editTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  instituteType: z.enum(["SCHOOL", "UNIVERSITY"], { required_error: "Please select an institute type." }),
  instituteName: z.string().min(3, "Institute name must be at least 3 characters."),
  leaderName: z.string().min(2, "Leader's name must be at least 2 characters."),
  leaderEmail: z.string().email("Please enter a valid email for the team leader."),
  leaderPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
});

export default function EditTeamPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const teamId = params.id as string;
    
    const deadline = new Date('2025-09-30T23:59:59');
    const canEdit = new Date() < deadline;

    const form = useForm<z.infer<typeof editTeamSchema>>({
        resolver: zodResolver(editTeamSchema),
        defaultValues: {},
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (teamId) {
                    const teamDocRef = doc(db, "teams", teamId);
                    try {
                        const teamDocSnap = await getDoc(teamDocRef);
                        if (teamDocSnap.exists()) {
                            const teamData = teamDocSnap.data();
                            if (teamData.creatorUid !== currentUser.uid) {
                                setError("You are not authorized to edit this team.");
                            } else {
                                form.reset(teamData);
                            }
                        } else {
                            setError("Team not found.");
                        }
                    } catch (err) {
                        setError("Failed to fetch team data.");
                    } finally {
                        setIsFetching(false);
                    }
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, teamId, form]);

    const onSubmit = async (values: z.infer<typeof editTeamSchema>) => {
        if (!user || !teamId || !canEdit) {
            toast({ title: "Error", description: "You are not authorized to perform this action or the deadline has passed.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const teamRef = doc(db, "teams", teamId);
            await updateDoc(teamRef, values);

            toast({
                title: 'Team Updated!',
                description: 'The team details have been successfully updated.',
            });
            router.push('/dashboard/teams');

        } catch (error) {
            console.error("Error updating team:", error);
            toast({
                title: 'Error',
                description: 'Failed to update the team. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isFetching) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2"/> Loading team details...</div>;
    }

    if (error) {
         return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>;
    }

    if (!canEdit) {
         return <div className="flex h-screen items-center justify-center text-destructive">Editing for teams has been closed after September 30th, 2025.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Team Details</h1>
                <p className="text-muted-foreground">Update the information for your team below.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Team Information</CardTitle>
                    <CardDescription>Changes will be saved for the entire team.</CardDescription>
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
                             <FormField
                                control={form.control}
                                name="instituteName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>School/University Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Parul University" {...field} />
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
                            <Button type="submit" disabled={isLoading || !user || !canEdit}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

        </div>
    )
}
