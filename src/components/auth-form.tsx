

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db, RecaptchaVerifier, signInWithPhoneNumber, signInWithGoogle } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const emailSchema = z.object({
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

const phoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number with country code (e.g., +919876543210)."),
});

const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be 6 digits."),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props} >
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.28,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
    );
}

interface AuthFormProps {
  isRegisterPage?: boolean;
}

export default function AuthForm({ isRegisterPage = false }: AuthFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [phoneStep, setPhoneStep] = useState<'phone' | 'otp'>('phone');
    const teamId = searchParams.get('teamId');
    const hasRecaptchaKey = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;


    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "", password: "" },
    });

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phone: "+91" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });
    
    useEffect(() => {
        if (hasRecaptchaKey && typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'invisible',
            });
        }
    }, [hasRecaptchaKey]);

    const handleRedirect = async (user: any) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        // If a profile exists (meaning they've filled out details) OR they have joined a team, go to dashboard.
        if (docSnap.exists() && (docSnap.data().leaderPhone || docSnap.data().teamId)) {
            router.push('/dashboard');
        } else {
            let path = '/profile';
            if (teamId) {
                path = `/profile?teamId=${teamId}`;
            }
            router.push(path);
        }
    }
    
    async function onEmailSubmit(values: z.infer<typeof emailSchema>) {
        setIsLoading(true);
        if (isRegisterPage) { // REGISTRATION
            if (!values.password) {
                 emailForm.setError("password", { type: "manual", message: "Password is required for registration." });
                 setIsLoading(false);
                 return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
                const user = userCredential.user;
                // Don't update profile with name here, it will be done on profile completion page
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.email, // Use email as a placeholder
                    createdAt: serverTimestamp(),
                    isAdmin: false,
                });
                await sendEmailVerification(user);
                toast({
                    title: "Registration Successful!",
                    description: "A verification email has been sent. Please check your inbox.",
                });
                router.push('/verify-email');
            } catch (error: any) {
                toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
            }
        } else { // LOGIN
            if (!values.password) {
                 emailForm.setError("password", { type: "manual", message: "Password is required for login." });
                 setIsLoading(false);
                 return;
            }
            try {
                const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
                toast({ title: "Login Successful", description: "Welcome back!" });
                await userCredential.user.reload(); // Ensure we have latest user state (like emailVerified)
                 if (!userCredential.user.emailVerified) {
                    router.push('/verify-email');
                } else {
                    await handleRedirect(userCredential.user);
                }
            } catch (error: any) {
                toast({ title: "Login Failed", description: error.message, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }
    
    async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
        setIsLoading(true);
        try {
            const appVerifier = (window as any).recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, values.phone, appVerifier);
            setConfirmationResult(result);
            setPhoneStep('otp');
            toast({ title: "OTP Sent", description: "An OTP has been sent to your phone number." });
        } catch (error: any) {
            toast({ title: "Failed to Send OTP", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
        if (!confirmationResult) return;
        setIsLoading(true);
        try {
            const userCredential = await confirmationResult.confirm(values.otp);
            const user = userCredential.user;
            
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
                const userData: any = {
                    uid: user.uid,
                    phoneNumber: user.phoneNumber,
                    displayName: user.phoneNumber, // Use phone number as placeholder
                    createdAt: serverTimestamp(),
                    isAdmin: false, 
                };
                if (teamId) userData.teamId = teamId;
                await setDoc(userDocRef, userData);
            }

            toast({ title: "Verification Successful!", description: "Welcome!" });
            await handleRedirect(user);
        } catch (error: any) {
             toast({ title: "Verification Failed", description: "The OTP was incorrect or has expired.", variant: "destructive" });
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
                 // Check registration deadline before creating a new user
                const settingsDoc = await getDoc(doc(db, "settings", "config"));
                if (settingsDoc.exists()) {
                    const deadline = settingsDoc.data().registrationCloseDate?.toDate();
                    if (deadline && new Date() > deadline) {
                        // This is a new user trying to sign up after the deadline.
                        await auth.signOut(); // Sign them out immediately
                        toast({
                            title: "Registration Closed",
                            description: "New registrations are not allowed at this time.",
                            variant: "destructive"
                        });
                        setIsGoogleLoading(false);
                        return;
                    }
                }

                const userData: any = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    createdAt: serverTimestamp(),
                    isAdmin: false,
                };
                if (teamId) userData.teamId = teamId;
                await setDoc(docRef, userData, { merge: true });
            }

            toast({ title: "Sign-in Successful!", description: "Welcome!" });
            await handleRedirect(user);
        } catch (error: any) {
             toast({ title: "Sign-in Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsGoogleLoading(false);
        }
    }

    return (
        <Card className="mt-8">
            <CardContent className="pt-6">
                <Tabs defaultValue="email">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="phone" disabled={!hasRecaptchaKey}>Phone</TabsTrigger>
                    </TabsList>
                    
                    {/* Email Tab */}
                    <TabsContent value="email">
                        <Form {...emailForm}>
                            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6 mt-4">
                                <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} disabled={isLoading} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={emailForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} disabled={isLoading} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : (isRegisterPage ? 'Register' : 'Sign In')}
                                </Button>
                                 {!isRegisterPage && (
                                    <Button type="button" variant="link" asChild className="w-full text-muted-foreground" size="sm" disabled={isLoading}>
                                       <Link href="/forgot-password">Forgot Password?</Link>
                                    </Button>
                                )}
                            </form>
                        </Form>
                    </TabsContent>

                    {/* Phone Tab */}
                    <TabsContent value="phone">
                         {!hasRecaptchaKey ? (
                             <Alert variant="destructive" className="mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Configuration Error</AlertTitle>
                                <AlertDescription>
                                    Phone sign-in is currently unavailable. The reCAPTCHA site key is missing from the environment configuration.
                                </AlertDescription>
                            </Alert>
                         ) : phoneStep === 'phone' ? (
                            <Form {...phoneForm}>
                                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6 mt-4">
                                    <FormField
                                        control={phoneForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl><Input placeholder="+919876543210" {...field} disabled={isLoading} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                             <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 mt-4">
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Verification Code (OTP)</FormLabel>
                                                <FormControl><Input placeholder="123456" {...field} disabled={isLoading} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading || isGoogleLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </TabsContent>
                </Tabs>

                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
                </div>
                <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon className="mr-2 h-5 w-5" /> Google</>}
                </Button>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    {isRegisterPage ? "Already have an account?" : "Don't have an account?"}{" "}
                    <Link href={isRegisterPage ? "/login" : "/register"} className="font-medium text-primary underline-offset-4 hover:underline">
                        {isRegisterPage ? "Login" : "Register"}
                    </Link>
                </div>
                <div id="recaptcha-container"></div>
            </CardContent>
        </Card>
    );
}
