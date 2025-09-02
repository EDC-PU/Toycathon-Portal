import RegisterForm from '@/components/register-form';

export default function RegisterPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary">Register for Toycathon</h1>
        <p className="mt-2 text-muted-foreground">Join the challenge and bring your ideas to life!</p>
      </div>
      <RegisterForm />
    </div>
  );
}
