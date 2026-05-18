'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
}

export default function AdminShell({ children, userEmail }: AdminShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 h-14 lg:h-16 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
        <span className="font-semibold text-gray-900">Admin Panel</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden sm:inline">{userEmail}</span>
          <Button variant="ghost" size="sm" onClick={() => router.push('/logout')} className="text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <div className="p-4 lg:p-8">{children}</div>
    </div>
  );
}
