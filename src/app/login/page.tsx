import LoginForm from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
            <div className="text-center">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-teal-green">Welcome Back</h1>
                <p className="mt-2 text-muted-foreground">Sign in to your account to continue.</p>
            </div>
            <LoginForm />
        </div>
    </div>
  );
}
