
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
import { Card, CardContent } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState } from "react";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.28,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
  }

export default function RegisterForm() {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const teamId = searchParams.get('teamId');


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const isProfileComplete = (profileData: any) => {
        return profileData && profileData.leaderPhone && profileData.college;
    }

    const handleRedirect = (user: any, teamId?: string | null) => {
        let path = '/profile';
        if (teamId) {
          path = `/profile?teamId=${teamId}`;
        }
        router.push(path);
    }


    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: values.name,
            });

             // Create user document in Firestore
             const userData: any = {
                uid: user.uid,
                displayName: values.name,
                email: values.email,
                createdAt: serverTimestamp(),
                isAdmin: false, // Default role is not admin
            };
            if (teamId) {
                userData.teamId = teamId;
            }
            await setDoc(doc(db, "users", user.uid), userData);

            toast({
                title: "Registration Successful!",
                description: "Let's complete your profile.",
            });
            handleRedirect(user, teamId);
        } catch (error: any) {
             toast({
                title: "Registration Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

     async function handleGoogleSignIn() {
        setIsGoogleLoading(true);
        try {
            const userCredential = await signInWithGoogle();
            const user = userCredential.user;
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                const userData: any = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    createdAt: serverTimestamp(),
                    isAdmin: false, // Default role is not admin
                };
                if (teamId) {
                    userData.teamId = teamId;
                }
                await setDoc(docRef, userData, { merge: true });
            }

            toast({
                title: "Sign-in Successful!",
                description: "Welcome! Let's complete your profile if needed.",
            });
            handleRedirect(user, teamId);
        } catch (error: any) {
             toast({
                title: "Sign-in Failed",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }

    return (
        <Card className="mt-8">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} disabled={isLoading}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                            {isLoading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                </Form>
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
                 <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? 'Signing In...' : <><GoogleIcon className="mr-2 h-5 w-5" /> Google</>}
                </Button>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
