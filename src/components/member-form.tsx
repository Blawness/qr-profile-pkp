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
import { UploadDropzone } from "@/lib/uploadthing";
import { Upload, X, Camera, User, Mail, Building2, Briefcase, Phone, Fingerprint } from "lucide-react";
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
  const [uploading, setUploading] = useState(false);

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {member ? "Edit Member" : "Tambah Member"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── PHOTO SECTION ── */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b">
            <Label className="text-xs text-gray-500 uppercase tracking-wider">Foto Profil</Label>

            {photoUrl ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-full">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">Mengupload...</span>
                  </div>
                ) : (
                  <UploadDropzone
                    endpoint="photoUploader"
                    className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:border-primary/50 hover:bg-primary/5 transition-colors ut-label:text-gray-600 ut-label:text-sm ut-allowed-content:text-gray-400 ut-allowed-content:text-xs ut-button:bg-primary ut-button:text-white ut-button:rounded-lg ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-button:hover:bg-primary/90 ut-upload-icon:text-primary/60 ut-upload-icon:w-10 ut-upload-icon:h-10"
                    onClientUploadComplete={(res) => {
                      setUploading(false);
                      if (res?.[0]) setPhotoUrl(res[0].url);
                    }}
                    onUploadError={(err) => {
                      setUploading(false);
                      setError(err.message);
                    }}
                    onUploadBegin={() => {
                      setUploading(true);
                    }}
                    appearance={{
                      container: "border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 hover:border-primary/50 hover:bg-primary/5 transition-colors p-4",
                      label: "text-gray-600 text-sm",
                      allowedContent: "text-gray-400 text-xs",
                      button: "bg-primary text-white rounded-lg px-4 py-2 text-sm hover:bg-primary/90 cursor-pointer",
                      uploadIcon: "text-primary/60 w-10 h-10 mx-auto",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── IDENTITY SECTION ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Identitas</p>

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-gray-600">
                <User className="w-3.5 h-3.5" /> Nama
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nama lengkap"
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="divisi" className="flex items-center gap-1.5 text-gray-600">
                  <Building2 className="w-3.5 h-3.5" /> Divisi
                </Label>
                <Input
                  id="divisi"
                  value={divisi}
                  onChange={(e) => setDivisi(e.target.value)}
                  placeholder="Divisi"
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan" className="flex items-center gap-1.5 text-gray-600">
                  <Briefcase className="w-3.5 h-3.5" /> Jabatan
                </Label>
                <Input
                  id="jabatan"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Jabatan"
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── CONTACT SECTION ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Kontak</p>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-gray-600">
                <Mail className="w-3.5 h-3.5" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noTelp" className="flex items-center gap-1.5 text-gray-600">
                <Phone className="w-3.5 h-3.5" /> Nomor Telpon
              </Label>
              <Input
                id="noTelp"
                value={noTelp}
                onChange={(e) => setNoTelp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* ── SYSTEM SECTION ── */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Sistem</p>

            <div className="space-y-2">
              <Label htmlFor="userId" className="flex items-center gap-1.5 text-gray-600">
                <Fingerprint className="w-3.5 h-3.5" /> User ID
              </Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={!!member}
                placeholder="UUID (otomatis jika kosong)"
                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono text-xs"
              />
              {!member && (
                <p className="text-[11px] text-gray-400">Kosongkan untuk generate otomatis saat simpan.</p>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <X className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
