"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import type { Member } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: MemberFormData) => Promise<void>;
  member?: Member | null;
};

export type MemberFormData = {
  name: string;
  email: string;
  userId: string;
  divisi: string;
  jabatan: string;
  noTelp: string;
  photoUrl: string;
};

export function MemberForm({ open, onClose, onSave, member }: Props) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [userId, setUserId] = useState(member?.userId || "");
  const [divisi, setDivisi] = useState(member?.divisi || "");
  const [jabatan, setJabatan] = useState(member?.jabatan || "");
  const [noTelp, setNoTelp] = useState(member?.noTelp || "");
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave({ name, email, userId, divisi, jabatan, noTelp, photoUrl });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {member ? "Edit Member" : "Tambah Member"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama lengkap"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userId">User ID (opsional)</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={!!member}
              placeholder="UUID dari absensi DB (kosongkan jika tidak ada)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="divisi">Divisi</Label>
            <Input
              id="divisi"
              value={divisi}
              onChange={(e) => setDivisi(e.target.value)}
              placeholder="Divisi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan</Label>
            <Input
              id="jabatan"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
              placeholder="Jabatan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noTelp">Nomor Telpon</Label>
            <Input
              id="noTelp"
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto</Label>
            {photoUrl ? (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPhotoUrl("")}
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <UploadButton
                endpoint="photoUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) setPhotoUrl(res[0].url);
                }}
                onUploadError={(err) => {
                  setError(err.message);
                }}
              />
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
