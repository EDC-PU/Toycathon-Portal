
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
import { addDoc, collection, serverTimestamp, doc, runTransaction, setDoc, getDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";


const createTeamSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  instituteType: z.enum(["SCHOOL", "UNIVERSITY"], { required_error: "Please select an institute type." }),
  instituteName: z.string().min(3, "Institute name must be at least 3 characters."),
  isLeader: z.boolean().default(false).optional(),
  leaderName: z.string().min(2, "Leader's name must be at least 2 characters."),
  leaderEmail: z.string().email("Please enter a valid email for the team leader."),
  leaderPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
});

export default function CreateTeamPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    const form = useForm<z.infer<typeof createTeamSchema>>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            teamName: "",
            instituteName: "",
            leaderName: "",
            leaderEmail: "",
            leaderPhone: "",
            isLeader: false,
        },
    });

    const isLeader = form.watch("isLeader");

     useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const profile = userDocSnap.data();
                    setUserProfile(profile);
                    if (isLeader) {
                        form.setValue('leaderName', profile.displayName || currentUser.displayName || "");
                        form.setValue('leaderEmail', currentUser.email || "");
                        form.setValue('leaderPhone', profile.leaderPhone || "");
                    }
                } else {
                     if (isLeader) {
                        form.setValue('leaderName', currentUser.displayName || "");
                        form.setValue('leaderEmail', currentUser.email || "");
                     }
                }
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router, form, isLeader]);

     useEffect(() => {
        if (isLeader && user) {
            form.setValue('leaderName', userProfile?.displayName || user.displayName || '');
            form.setValue('leaderEmail', user.email || '');
            form.setValue('leaderPhone', userProfile?.leaderPhone || '');
        } else {
             form.setValue('leaderName', '');
             form.setValue('leaderEmail', '');
             form.setValue('leaderPhone', '');
        }
    }, [isLeader, user, userProfile, form]);


    const onSubmit = async (values: z.infer<typeof createTeamSchema>) => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to create a team.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const counterRef = doc(db, "counters", "teamIds");
            const teamsCollectionRef = collection(db, "teams");
            
            await runTransaction(db, async (transaction) => {
                // 1. Check for unique team name
                const teamNameQuery = query(teamsCollectionRef, where("teamName", "==", values.teamName));
                const teamNameSnapshot = await getDocs(teamNameQuery);
                if (!teamNameSnapshot.empty) {
                    throw new Error("This team name is already taken. Please choose another one.");
                }

                // 2. Get the next sequential ID
                const counterDoc = await transaction.get(counterRef);
                const instituteTypeKey = values.instituteType.toLowerCase();
                let newCount = 1;

                if (counterDoc.exists()) {
                    newCount = (counterDoc.data()[instituteTypeKey] || 0) + 1;
                }
                
                const paddedCount = String(newCount).padStart(3, '0');
                const teamId = `VT/${values.instituteType}/${paddedCount}`;

                // 3. Update the counter
                transaction.set(counterRef, { [instituteTypeKey]: newCount }, { merge: true });
                
                // 4. Create the new team
                const newTeamDocRef = doc(teamsCollectionRef);
                transaction.set(newTeamDocRef, {
                    teamName: values.teamName,
                    instituteType: values.instituteType,
                    instituteName: values.instituteName,
                    leaderName: values.leaderName,
                    leaderEmail: values.leaderEmail,
                    leaderPhone: values.leaderPhone,
                    teamId: teamId,
                    creatorUid: user.uid,
                    createdAt: serverTimestamp(),
                });

                // 5. If creator is the leader, update their user document
                if (values.isLeader) {
                    const userRef = doc(db, "users", user.uid);
                    transaction.set(userRef, { teamId: newTeamDocRef.id }, { merge: true });
                }
            });

            toast({
                title: 'Team Created!',
                description: 'The team has been successfully created. You can now invite members.',
            });
            router.push('/dashboard/teams');

        } catch (error: any) {
            console.error("Error creating team:", error);
            toast({
                title: 'Error Creating Team',
                description: error.message || 'An unexpected error occurred. Please try again.',
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
                    <CardDescription>Enter the details for the team and its leader. Team names must be unique.</CardDescription>
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
                                    name="isLeader"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    I am the Team Leader
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="leaderName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Student's full name" {...field} disabled={isLeader} />
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
                                                <Input placeholder="student.email@example.com" {...field} disabled={isLeader} />
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
