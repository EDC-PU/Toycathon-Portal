
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users, CheckSquare, LogOut, Megaphone, FileText, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/teams', label: 'Teams', icon: Users },
  // { href: '/dashboard/status', label: 'Status', icon: CheckSquare }, // Can be re-added later
  { href: '/dashboard/submission', label: 'Submission', icon: FileText },
];

const adminNavLinks = [
    { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/dashboard/categories', label: 'Categories & Themes', icon: Tag },
];

interface DashboardSidebarProps {
    isAdmin: boolean;
    onLinkClick?: () => void;
}

export default function DashboardSidebar({ isAdmin, onLinkClick }: DashboardSidebarProps) {
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
    <aside className="flex flex-col w-64 bg-background border-r h-full">
      <div className="h-20 flex items-center px-6 border-b flex-shrink-0">
         <Link href="/">
              <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={180} height={41} className="h-10 w-auto object-contain" />
          </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href === '/dashboard/teams' && pathname.startsWith('/dashboard/teams'));
          return (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
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
                            const isActive = pathname.startsWith(link.href);
                            return (
                                <Link key={link.href} href={link.href} onClick={onLinkClick}>
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
      <div className="px-4 py-4 border-t flex-shrink-0">
         <Button
            variant={'ghost'}
            className="w-full justify-start"
            onClick={() => {
                handleLogout();
                if(onLinkClick) onLinkClick();
            }}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
