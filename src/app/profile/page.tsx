"use client";

import ProfileForm from '@/components/profile-form';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Complete Your Profile</h1>
        <p className="mt-2 text-muted-foreground">Tell us more about your team.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
