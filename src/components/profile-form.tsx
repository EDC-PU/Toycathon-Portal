
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  // teamName: z.string().min(2, "Team name must be at least 2 characters."),
  leaderName: z.string().min(2, "Your name must be at least 2 characters."),
  leaderPhone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
  college: z.string().min(3, "Institution name is required."),
  instituteType: z.enum(["school", "university"], { required_error: "Please select an institute type." }),
  rollNumber: z.string().min(1, "Roll number is required."),
  yearOfStudy: z.string().min(1, "Year of study/standard is required."),
  age: z.coerce.number().min(1, "Age is required.").positive("Age must be a positive number."),
  gender: z.enum(["male", "female"], { required_error: "Please select your gender." }),
});

interface ProfileFormProps {
  onProfileComplete?: () => void;
}

export default function ProfileForm({ onProfileComplete }: ProfileFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const teamId = searchParams.get('teamId');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            // teamName: "",
            leaderName: "",
            leaderPhone: "",
            college: "",
            rollNumber: "",
            yearOfStudy: "",
        },
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    form.reset(docSnap.data());
                } else {
                    if (currentUser.displayName) {
                        form.setValue('leaderName', currentUser.displayName);
                    }
                }
            }
        });
        return () => unsubscribe();
    }, [form]);


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
            await updateProfile(user, {
              displayName: values.leaderName
            });

            const userData: any = {
                ...values,
                email: user.email,
                uid: user.uid,
                displayName: values.leaderName,
            }

            if(teamId) {
                userData.teamId = teamId;
            }

            await setDoc(doc(db, "users", user.uid), userData, { merge: true });

            toast({
                title: "Profile Updated!",
                description: "Your information has been saved.",
            });
            
            if (onProfileComplete) {
                onProfileComplete();
            } else {
                router.push('/dashboard/profile');
            }

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
                <CardTitle>Your Information</CardTitle>
                <CardDescription>This information is required to participate.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="leaderName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
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
                                        <FormLabel>Your Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9876543210" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                             <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="19" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="male" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Male</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="female" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Female</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>

                        <div className="border-t pt-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="instituteType"
                                render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Type of Institute</FormLabel>
                                    <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex space-x-4"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="school" />
                                        </FormControl>
                                        <FormLabel className="font-normal">School</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="university" />
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
                                name="college"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Institution Name</FormLabel>
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
                                    name="rollNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Roll Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your roll number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearOfStudy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Year of Study / Standard</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 2nd Year or 12th Standard" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading || !user}>
                           {isLoading ? "Saving..." : "Save Information"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
