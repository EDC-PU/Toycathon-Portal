
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Users, CheckSquare, LogOut, Megaphone, FileText, Tag, Settings, BarChart2, Shield, HeartPulse } from 'lucide-react';
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
  { href: '/dashboard/submission', label: 'Submission', icon: FileText },
];

const adminNavLinks = [
    { href: '/admin', label: 'Overview', icon: BarChart2 },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
    { href: '/admin/teams', label: 'Manage Teams', icon: Shield },
    { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/admin/categories', label: 'Categories & Themes', icon: Tag },
    { href: '/admin/settings', label: 'Event Settings', icon: Settings },
    { href: '/admin/health', label: 'System Health', icon: HeartPulse },
    { href: '/admin/profile', label: 'Admin Profile', icon: Settings },
];

interface DashboardSidebarProps {
    isAdmin: boolean;
    teamInfo?: { teamName: string; teamId: string } | null;
    onLinkClick?: () => void;
}

export default function DashboardSidebar({ isAdmin, teamInfo, onLinkClick }: DashboardSidebarProps) {
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

  const linksToRender = isAdmin ? adminNavLinks : navLinks;


  return (
    <aside className="flex flex-col w-64 bg-background border-r h-full">
      <div className="h-20 flex items-center px-6 border-b flex-shrink-0">
         <Link href="/">
              <Image src="https://paruluniversity.ac.in/pu-web/images/logo.png" alt="Parul University Logo" width={180} height={41} className="h-10 w-auto object-contain" />
          </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {linksToRender.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin' && pathname.startsWith(link.href));
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
      </nav>
      <div className="px-4 py-4 border-t flex-shrink-0 space-y-2">
         {teamInfo && !isAdmin && (
            <div className="p-3 rounded-md bg-secondary text-secondary-foreground text-xs">
                <p className="font-bold truncate">{teamInfo.teamName}</p>
                <p className="font-mono text-muted-foreground">{teamInfo.teamId}</p>
            </div>
         )}
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
