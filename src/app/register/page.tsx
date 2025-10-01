
"use client";

import AuthForm from '@/components/auth-form';
import { Suspense, useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function RegisterContent() {
    const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);

    useEffect(() => {
        const checkDeadline = async () => {
            try {
                const settingsDoc = await getDoc(doc(db, "settings", "config"));
                if (settingsDoc.exists()) {
                    const deadline = settingsDoc.data().registrationCloseDate?.toDate();
                    if (deadline && new Date() > deadline) {
                        setRegistrationOpen(false);
                    } else {
                        setRegistrationOpen(true);
                    }
                } else {
                    setRegistrationOpen(true); // If no settings, assume it's open
                }
            } catch (error) {
                console.error("Error checking registration deadline:", error);
                setRegistrationOpen(true); // Fail open
            }
        };
        checkDeadline();
    }, []);

    if (registrationOpen === null) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Checking registration status...</div>;
    }

    if (!registrationOpen) {
        return (
            <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
                 <Card className="w-full max-w-md border-destructive">
                    <CardHeader className="items-center text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                        <CardTitle className="text-2xl">Registration Closed</CardTitle>
                        <CardDescription>
                            We are no longer accepting new registrations for the Vadodara Toycathon 2025.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button asChild>
                            <Link href="/">Return to Homepage</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Create an Account</h1>
                    <p className="mt-2 text-muted-foreground">Join the challenge and bring your ideas to life!</p>
                </div>
                <AuthForm isRegisterPage={true} />
            </div>
        </div>
    )
}


export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading registration form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

    