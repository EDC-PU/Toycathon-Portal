"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

const formSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters."),
  leaderName: z.string().min(2, "Leader name must be at least 2 characters."),
  leaderPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  college: z.string().min(3, "College name is required."),
  members: z.string().min(10, "Please list your team members.").optional(),
});

export default function ProfileForm() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teamName: "",
            leaderName: "",
            leaderPhone: "",
            college: "",
            members: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({
                title: "Not Authenticated",
                description: "You must be logged in to update your profile.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                ...values,
                email: user.email,
            }, { merge: true });

            toast({
                title: "Profile Updated!",
                description: "Your team information has been saved.",
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Failed to update profile.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Team Information</CardTitle>
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
                                        <Input placeholder="e.g. The Toy Story" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="college"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>College/Institution Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Parul University" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="leaderName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team Leader's Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
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
                                        <FormLabel>Team Leader's Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="members"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Members</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="List your team members' names, one per line."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !user}>
                           {isLoading ? "Saving..." : "Save Profile"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
