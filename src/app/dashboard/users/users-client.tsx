"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Shield, User } from "lucide-react";

type UserRecord = {
  id: number;
  username: string;
  role: string;
  createdAt: string | null;
};

export function UsersClient() {
  const [userList, setUserList] = useState<UserRecord[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"operator" | "admin">("operator");
  const [adding, setAdding] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUserList(data.users);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`User "${data.user.username}" berhasil dibuat.`);
        setUsername("");
        setPassword("");
        setRole("operator");
        fetchUsers();
      } else {
        setError(data.error || "Gagal membuat user.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Hapus user "${user.username}"?`)) return;
    setError("");

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        fetchUsers();
      } else {
        setError(data.error || "Gagal menghapus user.");
      }
    } catch {
      setError("Gagal terhubung ke server.");
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* ADD USER FORM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="w-4 h-4" />
            Tambah User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 4 karakter"
                  required
                  minLength={4}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-gray-600">Role:</Label>
              <button
                type="button"
                onClick={() => setRole("operator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  role === "operator"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  role === "admin"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                Admin
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" disabled={adding} size="sm">
              {adding ? "Menyimpan..." : "Tambah User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* USER LIST */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            Daftar User ({userList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada user.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
