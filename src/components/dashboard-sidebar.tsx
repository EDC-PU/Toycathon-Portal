
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users, CheckSquare, LogOut, Megaphone } from 'lucide-react';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/team', label: 'Team', icon: Users },
  { href: '/dashboard/status', label: 'Status', icon: CheckSquare },
];

const adminNavLinks = [
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
];

interface DashboardSidebarProps {
    isAdmin: boolean;
}

export default function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };


  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r">
      <div className="h-20 flex items-center px-6 border-b">
         <Link href="/">
              <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={180} height={41} className="h-10 w-auto object-contain" />
          </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          );
        })}
        {isAdmin && (
            <>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Admin
                    </h2>
                    <div className="space-y-1">
                        {adminNavLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}>
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className="w-full justify-start"
                                >
                                    <link.icon className="mr-2 h-4 w-4" />
                                    {link.label}
                                </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </>
        )}
      </nav>
      <div className="px-4 py-4 border-t">
         <Button
            variant={'ghost'}
            className="w-full justify-start"
            onClick={handleLogout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
