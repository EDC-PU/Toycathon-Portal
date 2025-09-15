
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderAuthProps {
    isMobile?: boolean;
    onLinkClick?: () => void;
}

export default function HeaderAuth({ isMobile = false, onLinkClick }: HeaderAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isMobile) {
    return user ? (
        <>
        <Button variant="outline" asChild>
            <Link href="/dashboard" onClick={onLinkClick}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            </Link>
        </Button>
            <Button onClick={() => { handleLogout(); if(onLinkClick) onLinkClick(); }}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
        </>
    ) : (
        <>
        <Button variant="outline" asChild>
            <Link href="/login" onClick={onLinkClick}>Login</Link>
        </Button>
        <Button asChild>
            <Link href="/register" onClick={onLinkClick}>Register</Link>
        </Button>
        </>
    );
  }

  return user ? (
        <div className="flex items-center gap-4">
            <Button asChild>
                <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                <Link href="/dashboard/teams">My Teams</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ) : (
        <>
            <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
            <Link href="/register">Register</Link>
            </Button>
        </>
    );
}

