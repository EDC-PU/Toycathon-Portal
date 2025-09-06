
"use client";

import AuthForm from '@/components/auth-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function RegisterContent() {
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
