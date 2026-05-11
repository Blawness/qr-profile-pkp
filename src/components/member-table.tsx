"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Member } from "@/lib/types";

type Props = {
  members: Member[];
  onEdit: (member: Member) => void;
  onViewQR: (member: Member) => void;
  onDelete: (member: Member) => void;
};

export function MemberTable({ members, onEdit, onViewQR, onDelete }: Props) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Belum ada member. Klik &quot;Tambah Member&quot; untuk menambahkan.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>QR</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email || "-"}</TableCell>
              <TableCell className="font-mono text-xs">
                {member.userId ? `${member.userId.substring(0, 8)}...` : "-"}
              </TableCell>
              <TableCell>
                {member.qrCodeUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewQR(member)}
                  >
                    QR
                  </Button>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(member)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(member)}
                >
                  Hapus
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
