
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MailCheck, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await currentUser.reload();
                if (currentUser.emailVerified) {
                    router.push('/dashboard');
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleResendVerification = async () => {
        if (!user) return;
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: "Email Sent!",
                description: "A new verification email has been sent to your inbox.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to send verification email. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };
    
    const handleContinue = () => {
        auth.signOut().then(() => {
            router.push('/login');
            toast({
                title: "Check your inbox",
                description: "Please log in again after you have verified your email address.",
            })
        });
    }

    if (loading) {
        return <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center"><Loader2 className="animate-spin mr-2" /> Checking your status...</div>;
    }

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center text-center">
                    <MailCheck className="h-16 w-16 text-primary mb-4" />
                    <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                    <CardDescription>
                        A verification link has been sent to your email address: <strong>{user?.email}</strong>. Please check your inbox and spam folder.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm">
                        You need to verify your email to access the dashboard.
                        Once you've clicked the link in the email, you can continue.
                    </p>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     <Button className="w-full" onClick={handleContinue}>
                        I've Verified, Continue to Login
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={isSending}
                    >
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Resend Verification Email
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
