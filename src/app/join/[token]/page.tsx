
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { runTransaction, doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { addMemberToTeam } from '@/ai/flows/add-member-to-team-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import AuthForm from '@/components/auth-form';

type JoinStatus = 'loading' | 'requires_auth' | 'adding_to_team' | 'success' | 'error';

export default function JoinTeamPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const token = params.token as string;

  const [status, setStatus] = useState<JoinStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. The link is invalid.');
      setStatus('error');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleLoggedInUser(user, token);
      } else {
        // User is not logged in, show the registration/login form
        setStatus('requires_auth');
      }
    });

    return () => unsubscribe();
  }, [token]);

  const handleLoggedInUser = async (user: User, teamId: string) => {
    setStatus('adding_to_team');
    
    // Check if user profile is complete
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (!userDocSnap.exists() || !userDocSnap.data().leaderPhone) {
        // Profile is incomplete, redirect them to complete it.
        // Pass the token along so they can join after.
        router.push(`/profile?joinToken=${teamId}`);
        return;
    }
    
    if (userDocSnap.data().teamId) {
        router.push('/dashboard');
        toast({ title: "You are already in a team."});
        return;
    }

    // Profile is complete, try to add them to the team
    const result = await addMemberToTeam({ teamId: teamId, userId: user.uid });

    if (result.success) {
      setTeamName(result.teamName || 'the team');
      setStatus('success');
      toast({
        title: 'Successfully Joined Team!',
        description: `Welcome to ${result.teamName}! You will now be redirected to your dashboard.`,
      });
      setTimeout(() => router.push('/dashboard'), 3000);
    } else {
      setError(result.message);
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardTitle className="text-2xl mt-4">Verifying Invitation...</CardTitle>
            <CardDescription>Please wait while we check your invitation link.</CardDescription>
          </>
        );
      case 'requires_auth':
        return (
            <>
                <CardTitle className="text-2xl text-center">Join a Team</CardTitle>
                <CardDescription className="text-center mb-4">
                    Sign up or log in to accept your team invitation.
                </CardDescription>
                <AuthForm />
            </>
        );
      case 'adding_to_team':
        return (
           <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardTitle className="text-2xl mt-4">Joining Team...</CardTitle>
            <CardDescription>Finalizing your membership, one moment...</CardDescription>
          </>
        );
      case 'success':
        return (
          <>
            <ShieldCheck className="h-16 w-16 text-green-500" />
            <CardTitle className="text-2xl mt-4">Welcome to the Team!</CardTitle>
            <CardDescription>
              You have successfully joined <strong>{teamName}</strong>. Redirecting you to the dashboard...
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard Now</Link>
            </Button>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <CardTitle className="text-2xl mt-4">Failed to Join Team</CardTitle>
            <CardDescription>{error || 'An unknown error occurred.'}</CardDescription>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            {status !== 'requires_auth' && renderContent()}
        </CardHeader>
        {status === 'requires_auth' && (
            <CardContent>
                {renderContent()}
            </CardContent>
        )}
      </Card>
    </div>
  );
}
