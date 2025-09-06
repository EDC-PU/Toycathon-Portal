
"use client";

import AuthForm from '@/components/auth-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoginContent() {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Welcome Back</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to your account to continue.</p>
                </div>
                <AuthForm />
            </div>
        </div>
    );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
