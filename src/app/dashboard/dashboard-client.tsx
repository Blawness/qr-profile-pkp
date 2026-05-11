"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MemberTable } from "@/components/member-table";
import { MemberForm, type MemberFormData } from "@/components/member-form";
import { QRDisplay } from "@/components/qr-display";
import type { Member } from "@/lib/types";

type Props = {
  initialMembers: Member[];
  fetchError: string | null;
};

export function DashboardClient({ initialMembers, fetchError }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [qrMember, setQrMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(fetchError);

  const handleAdd = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleViewQR = (member: Member) => {
    setQrMember(member);
  };

  const handleDelete = async (member: Member) => {
    if (!confirm(`Hapus member "${member.name}"?`)) return;

    const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } else {
      setError("Gagal menghapus member.");
    }
  };

  const handleSave = async (data: MemberFormData) => {
    if (editingMember) {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal update member.");
      const json = await res.json();
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? json.member : m))
      );
    } else {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal membuat member.");
      }
      const json = await res.json();
      const newMember = json.member;
      setMembers((prev) => [...prev, newMember]);

      try {
        const qrRes = await fetch("/api/members/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: newMember.id }),
        });
        if (qrRes.ok) {
          const qrJson = await qrRes.json();
          setMembers((prev) =>
            prev.map((m) =>
              m.id === newMember.id
                ? { ...m, qrCodeUrl: qrJson.qrCodeUrl }
                : m
            )
          );
        }
      } catch {
        console.error("Failed to generate QR");
      }
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Daftar Member ({members.length})
        </h2>
        <Button onClick={handleAdd}>Tambah Member</Button>
      </div>
      <MemberTable
        members={members}
        onEdit={handleEdit}
        onViewQR={handleViewQR}
        onDelete={handleDelete}
      />
      <MemberForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        member={editingMember}
      />
      <QRDisplay
        open={!!qrMember}
        onClose={() => setQrMember(null)}
        member={qrMember}
      />
    </div>
  );
}
