"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, Mail, Phone } from "lucide-react";

type Props = {
  userId: string | null;
  name: string;
  photoUrl: string | null;
  email: string | null;
  divisi: string | null;
  jabatan: string | null;
  noTelp: string | null;
  dbName: string | null;
  fetchError: string | null;
};

export function ScanView({ name, photoUrl, email, divisi, jabatan, noTelp, dbName, fetchError }: Props) {
  const displayName = dbName || name;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 flex flex-col items-center gap-4 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="Logo"
            className="absolute top-3 left-4 h-8 w-auto object-contain"
          />
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

          {fetchError && (
            <div className="w-full bg-red-50 border border-red-200 rounded-md p-3 text-center">
              <p className="text-red-700 font-semibold">Gagal</p>
              <p className="text-red-600 text-sm">{fetchError}</p>
            </div>
          )}

          <div className="w-full space-y-2 pt-2">
            {divisi && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">Divisi</span>
                  <p className="font-medium">{divisi}</p>
                </div>
              </div>
            )}
            {jabatan && (
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">Jabatan</span>
                  <p className="font-medium">{jabatan}</p>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">Email</span>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            )}
            {noTelp && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-gray-500 text-xs">No. Telpon</span>
                  <p className="font-medium">{noTelp}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
