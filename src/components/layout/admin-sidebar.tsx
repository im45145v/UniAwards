"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CheckSquare,
  LayoutDashboard,
  Users,
  Vote,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin/polls", label: "Polls", icon: LayoutDashboard },
  { href: "/admin/nominations", label: "Nominations", icon: CheckSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/voting", label: "Voting Control", icon: Vote },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-neutral-200 bg-white p-4">
      <h2 className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">
        Admin Dashboard
      </h2>
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-neutral-100 text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
