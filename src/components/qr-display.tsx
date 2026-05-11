"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Member } from "@/lib/types";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  member: Member | null;
};

export function QRDisplay({ open, onClose, member }: Props) {
  const [copied, setCopied] = useState(false);

  if (!member) return null;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encodedName = encodeURIComponent(member.name);
  const params = new URLSearchParams({ name: encodedName });
  if (member.userId) params.set("userId", member.userId);
  const scanUrl = `${baseUrl}/scan?${params.toString()}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!member.qrCodeUrl) return;
    const res = await fetch(member.qrCodeUrl);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${member.name}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code - {member.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          {member.qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.qrCodeUrl}
              alt={`QR ${member.name}`}
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400">QR belum dibuat</span>
            </div>
          )}
          <div className="flex gap-2 w-full">
            <Input value={scanUrl} readOnly className="text-xs font-mono" />
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button
            className="w-full"
            variant="outline"
            onClick={handleDownload}
            disabled={!member.qrCodeUrl}
          >
            Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
