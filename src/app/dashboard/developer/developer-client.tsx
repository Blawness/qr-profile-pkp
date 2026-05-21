"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react";

export function DeveloperClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleRegenerateAll = async () => {
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/members/regenerate-qr", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || `Berhasil regenerate ${data.count} QR code.`);
      } else {
        setStatus("error");
        setMessage(data.error || "Gagal regenerate QR.");
      }
    } catch {
      setStatus("error");
      setMessage("Gagal terhubung ke server.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="w-4 h-4" />
            Regenerate All QR Codes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate ulang semua QR code member menggunakan domain saat ini (
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
              {typeof window !== "undefined" ? window.location.origin : ""}
            </code>
            ). Gunakan ini jika domain aplikasi berubah atau QR lama tidak berfungsi.
          </p>

          {status === "success" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}

          <Button
            onClick={handleRegenerateAll}
            disabled={status === "loading"}
            variant="default"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Meregenerate...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate All QR
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
