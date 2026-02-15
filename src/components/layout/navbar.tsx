"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Shield, Trophy } from "lucide-react";
import type { User } from "@/lib/types";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold">
          🏆 UniAwards
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm">
              <Trophy className="mr-1 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="mr-1 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin/polls">
              <Button variant="ghost" size="sm">
                <Shield className="mr-1 h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          <span className="text-sm text-neutral-500">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
