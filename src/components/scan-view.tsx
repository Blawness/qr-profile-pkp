"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, Briefcase, Mail, Phone, Check } from "lucide-react";

type Props = {
  userId: string | null;
  memberId: number | null;
  name: string;
  photoUrl: string | null;
  email: string | null;
  divisi: string | null;
  jabatan: string | null;
  noTelp: string | null;
  dbName: string | null;
  fetchError: string | null;
};

const goldColor = "oklch(72% 0.1 80)";

export function ScanView({ memberId, name, photoUrl, email, divisi, jabatan, noTelp, dbName, fetchError }: Props) {
  const displayName = dbName || name;

  const idLabel = memberId ? `PKP-${String(memberId).padStart(3, "0")}` : null;

  const infoPills: { icon: React.ReactNode; label: string; value: string; accent?: boolean }[] = [];
  if (jabatan) {
    const value = divisi ? `${jabatan} — ${divisi}` : jabatan;
    infoPills.push({ icon: <Briefcase className="w-[15px] h-[15px] text-primary" strokeWidth={1.8} />, label: "Jabatan", value });
  }
  if (email) {
    infoPills.push({ icon: <Mail className="w-[15px] h-[15px] text-primary" strokeWidth={1.8} />, label: "Email", value: email, accent: true });
  }
  if (noTelp) {
    infoPills.push({ icon: <Phone className="w-[15px] h-[15px] text-primary" strokeWidth={1.8} />, label: "No. Telpon", value: noTelp });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#edecea" }}>
      <Card className="w-full max-w-[320px] !p-0 !gap-0 rounded-[36px] overflow-hidden animate-[rise_0.6s_cubic-bezier(0.22,1,0.36,1)_both] border-0 shadow-[0_32px_64px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)]">
        {/* PHOTO AREA */}
        <div className="relative h-[300px] bg-gradient-to-br from-[#d5ede6] to-[#c2dbd4] overflow-hidden">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={displayName}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center">
              <div className="relative">
                <div className="w-[90px] h-[90px] rounded-full bg-[#a8ccc4] absolute -top-[50px] left-1/2 -translate-x-1/2" />
                <div className="w-[200px] h-[260px] rounded-t-full bg-gradient-to-b from-[#a8ccc4] to-[#85b5ab]" />
              </div>
            </div>
          )}

          {/* Brand chip top-left */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/80 backdrop-blur-lg rounded-full pl-2 pr-3 py-1.5 border border-white/90">
            <div className="w-[22px] h-[22px] rounded-md bg-primary flex items-center justify-center">
              <Building2 className="w-[13px] h-[13px]" style={{ color: goldColor }} />
            </div>
            <span className="text-[10px] font-medium text-primary uppercase tracking-widest">PKP</span>
          </div>

          {/* ID chip top-right */}
          {idLabel && (
            <div className="absolute top-4 right-4 bg-primary rounded-full px-2.5 py-1.5">
              <span className="text-[10px] font-medium tracking-wider" style={{ color: goldColor }}>
                {idLabel}
              </span>
            </div>
          )}

          {/* Photo fade */}
          {photoUrl && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white" />
          )}
        </div>

        {/* CARD BODY */}
        <CardContent className="px-[22px] pt-1 pb-[22px]">
          {fetchError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center mb-4">
              <p className="text-red-700 font-semibold text-sm">Gagal</p>
              <p className="text-red-600 text-xs">{fetchError}</p>
            </div>
          ) : (
            <>
              {/* Name row */}
              <div className="flex items-center gap-2 mb-4">
                <h1 className="text-[22px] font-serif text-[#1a1a18] tracking-[-0.3px] leading-tight">
                  {displayName}
                </h1>
                <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Info pills */}
              <div className="flex flex-col gap-2">
                {infoPills.map((pill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-[10px] p-[10px_14px] bg-[#f6f5f2] rounded-[14px]"
                  >
                    <div className="w-[30px] h-[30px] rounded-lg bg-[#e1f5ee] flex items-center justify-center shrink-0">
                      {pill.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] font-medium text-[#9a9993] uppercase tracking-wider">
                        {pill.label}
                      </span>
                      <span className={`block text-[13px] text-[#1a1a18] truncate ${pill.accent ? "text-primary" : ""}`}>
                        {pill.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
