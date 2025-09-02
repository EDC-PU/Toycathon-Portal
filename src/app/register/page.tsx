
"use client";

import RegisterForm from '@/components/register-form';
import { Suspense } from 'react';

function RegisterContent() {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Create an Account</h1>
                    <p className="mt-2 text-muted-foreground">Join the challenge and bring your ideas to life!</p>
                </div>
                <RegisterForm />
            </div>
        </div>
    )
}


export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
