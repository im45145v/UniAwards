"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { User, UserRole } from "@/lib/types";
import { Search } from "lucide-react";

interface UsersManagerProps {
  initialUsers: User[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  voter: "bg-blue-100 text-blue-800",
  viewer: "bg-neutral-100 text-neutral-800",
};

export function UsersManager({ initialUsers }: UsersManagerProps) {
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search users by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.length === 0 && (
          <p className="py-12 text-center text-neutral-400">No users found.</p>
        )}
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-xs text-neutral-400">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={ROLE_COLORS[user.role]} variant="secondary">
                  {user.role}
                </Badge>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  className="w-32"
                >
                  <option value="viewer">Viewer</option>
                  <option value="voter">Voter</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
