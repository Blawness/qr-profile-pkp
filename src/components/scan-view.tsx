"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { autoCheckIn } from "@/lib/absensi";

type Props = {
  userId: string | null;
  name: string;
  photoUrl: string | null;
  dbName: string | null;
  fetchError: string | null;
};

type Status =
  | { type: "idle" }
  | { type: "loading_gps" }
  | { type: "loading_attendance" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ScanView({ userId, name, photoUrl, dbName, fetchError }: Props) {
  const [status, setStatus] = useState<Status>(
    fetchError ? { type: "error", message: fetchError } : { type: "idle" }
  );

  const displayName = dbName || name;

  const handleCheckIn = async () => {
    setStatus({ type: "loading_gps" });

    if (!("geolocation" in navigator)) {
      setStatus({
        type: "error",
        message: "GPS tidak tersedia di perangkat ini.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus({ type: "loading_attendance" });

        try {
          const result = await autoCheckIn(
            userId!,
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );

          if (result.success) {
            setStatus({ type: "success", message: result.message || "Absen berhasil!" });
          } else {
            setStatus({
              type: "error",
              message: result.message || "Gagal absen. Coba lagi.",
            });
          }
        } catch {
          setStatus({
            type: "error",
            message: "Gagal terhubung. Periksa koneksi.",
          });
        }
      },
      (error) => {
        let message: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Izinkan akses lokasi untuk absen.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Gagal mendapatkan lokasi. Coba lagi.";
            break;
          case error.TIMEOUT:
            message = "Waktu permintaan lokasi habis. Coba lagi.";
            break;
          default:
            message = "Gagal mendapatkan lokasi.";
        }
        setStatus({ type: "error", message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isButtonDisabled =
    status.type === "loading_gps" || status.type === "loading_attendance";

  const hasAbsensi = userId !== null;

  const buttonLabel =
    status.type === "loading_gps"
      ? "Mendapatkan lokasi..."
      : status.type === "loading_attendance"
        ? "Mengirim absen..."
        : "Absen Sekarang";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              className="w-40 h-40 rounded-full object-cover border-4 border-primary"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-400">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h2 className="text-xl font-bold text-center">{displayName}</h2>
          {!hasAbsensi && (
            <p className="text-sm text-gray-500">Profil — absensi tidak tersedia</p>
          )}

          {status.type === "success" && (
            <div className="w-full bg-green-50 border border-green-200 rounded-md p-3 text-center">
              <p className="text-green-700 font-semibold">Absen Berhasil</p>
              <p className="text-green-600 text-sm">{status.message}</p>
            </div>
          )}

          {status.type === "error" && (
            <div className="w-full bg-red-50 border border-red-200 rounded-md p-3 text-center">
              <p className="text-red-700 font-semibold">Gagal</p>
              <p className="text-red-600 text-sm">{status.message}</p>
            </div>
          )}

          {hasAbsensi && status.type !== "success" && (
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckIn}
              disabled={isButtonDisabled}
            >
              {buttonLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
