'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from './ui/button';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-10 bg-slate-200 animate-pulse rounded-md" />;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">{session.user?.name || session.user?.email}</span>
        <Button onClick={() => signOut()} variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn('google')} size="sm">
      <LogIn className="mr-2 h-4 w-4" />
      Sign In with Google
    </Button>
  );
}