
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode, checkActionCode, applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const passwordResetSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function AuthActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    setMode(modeParam);
    setActionCode(oobCode);

    if (!modeParam || !oobCode) {
      setError('Invalid request. Missing required parameters.');
      setLoading(false);
      return;
    }

    const handleAction = async () => {
      try {
        switch (modeParam) {
          case 'resetPassword':
            await verifyPasswordResetCode(auth, oobCode);
            setSuccess('Valid link. You can now reset your password.');
            break;
          case 'verifyEmail':
            await applyActionCode(auth, oobCode);
            setSuccess('Your email has been verified! You can now log in.');
            break;
          default:
            setError('Unsupported action.');
        }
      } catch (err: any) {
        setError(err.message || 'Invalid or expired action link.');
      } finally {
        setLoading(false);
      }
    };

    handleAction();
  }, [searchParams]);

  const onPasswordResetSubmit = async (values: z.infer<typeof passwordResetSchema>) => {
    if (!actionCode) return;
    setLoading(true);
    try {
      await confirmPasswordReset(auth, actionCode, values.newPassword);
      toast({
        title: 'Password Reset Successful',
        description: 'You can now log in with your new password.',
      });
      router.push('/login');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to reset password. The link may have expired.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Verifying link...
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-destructive">
             <CardHeader className="items-center text-center">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <CardTitle className="text-2xl">Invalid Link</CardTitle>
                <CardDescription>{error}</CardDescription>
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
        {mode === 'resetPassword' && (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                    <CardDescription>Enter a new password for your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onPasswordResetSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
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
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}
        {mode === 'verifyEmail' && (
             <Card className="w-full max-w-md border-primary">
                 <CardHeader className="items-center text-center">
                    <ShieldCheck className="h-16 w-16 text-primary mb-4" />
                    <CardTitle className="text-2xl">Email Verified!</CardTitle>
                    <CardDescription>{success}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button asChild>
                        <Link href="/login">Continue to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}


export default function AuthActionPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading...</div>}>
            <AuthActionHandler />
        </Suspense>
    )
}
