'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { toast } from '@/hooks/use-toast';

export function ProfileDropdown() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !user) {
    return (
      <Button
        variant="ghost"
        className="relative h-10 w-10 rounded-full bg-primary/10"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/20 text-primary">
            ...
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  const userInitials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  const userImage = user.image || undefined;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-colors duration-200 p-0"
        >
          <Avatar className="h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/30 transition-all">
            <AvatarImage src={userImage} alt={user.name || user.email} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-xl shadow-lg border border-primary/10"
        align="end"
        forceMount
      >
        <div className="flex flex-col items-center p-4 pb-2">
          <Avatar className="h-20 w-20 mb-3 ring-2 ring-primary/20">
            <AvatarImage
              src={userImage}
              alt={user.name || user.email}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="opacity-50 mt-2" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="p-3 cursor-pointer hover:bg-primary/5 focus:bg-primary/10"
          >
            <Link href="/profile" className="flex items-center gap-2">
              <User size={16} className="text-muted-foreground" />
              <span>Profile</span>
              <DropdownMenuShortcut className="text-xs opacity-60">
                ⇧⌘P
              </DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="opacity-50" />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="p-3 cursor-pointer hover:bg-red-50 focus:bg-red-100 text-red-600 hover:text-red-700"
        >
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            <span>Log out</span>
          </div>
          <DropdownMenuShortcut className="text-xs opacity-60">
            ⇧⌘Q
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
