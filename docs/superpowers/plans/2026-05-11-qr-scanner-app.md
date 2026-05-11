# QR Scanner App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js QR code-based attendance scanner app with admin dashboard for CRUD members, photo uploads, QR generation, and GPS-based check-in via external attendance API.

**Architecture:** Next.js 16 App Router with `/scan` (public, GPS check-in) and `/dashboard` (admin CRUD with simple password auth). PostgreSQL via Drizzle ORM + Neon, UploadThing for file storage, `qrcode` npm for QR generation, shadcn/ui + Tailwind for UI.

**Tech Stack:** Next.js 16, Drizzle ORM, Neon PostgreSQL, UploadThing, qrcode, shadcn/ui, Tailwind CSS, TypeScript

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.example`

- [ ] **Step 1: Scaffold Next.js with create-next-app**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

Expected: Project scaffolded with package.json, next.config.ts, tsconfig.json, etc.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install drizzle-orm @neondatabase/serverless qrcode uploadthing @uploadthing/react
npm install -D drizzle-kit @types/qrcode
```

- [ ] **Step 3: Create .env.example**

Write `src/../.env.example`:
```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/db?sslmode=require

# External Attendance API
ABSENSI_API_KEY=api_live_xxxxx
ABSENSI_BASE_URL=http://localhost:3004

# Admin auth
ADMIN_PASSWORD=secret123

# UploadThing
UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=xxxxx

# App URL (for QR link generation)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: scaffold next.js project with core dependencies"
```

---

### Task 2: Configure Environment and TypeScript

**Files:**
- Modify: `next.config.ts`, `tsconfig.json`

- [ ] **Step 1: Update next.config.ts for serverExternalPackages**

Read `next.config.ts`, then write:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
```

- [ ] **Step 2: Verify TypeScript config has correct paths**

Read `tsconfig.json`, confirm it has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

If missing, add the `paths` entry.

- [ ] **Step 3: Verify src/app/layout.tsx exists and update metadata**

Write `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QR Scanner",
  description: "QR Code Attendance Scanner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: configure next.js and typescript"
```

---

### Task 3: Setup Drizzle ORM + Neon

**Files:**
- Create: `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`

- [ ] **Step 1: Create drizzle.config.ts**

Write `drizzle.config.ts`:
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 2: Create DB schema**

Write `src/db/schema.ts`:
```typescript
import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 512 }),
  qrCodeUrl: varchar("qr_code_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 3: Create DB connection**

Write `src/db/index.ts`:
```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 4: Verify build succeeds**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add drizzle orm schema and neon connection"
```

---

### Task 4: Push Schema to Database

**Files:**
- Create: `.env` (from `.env.example` — user provides real values)

- [ ] **Step 1: Push schema to Neon**

Run:
```bash
npx drizzle-kit push
```

Expected: Schema pushed successfully to Neon. Verify via Neon console or:
```bash
npx drizzle-kit studio
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "chore: push db schema"
```

---

### Task 5: Setup shadcn/ui

**Files:**
- Modify: `tsconfig.json` (if needed)

- [ ] **Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

Expected: components.json created, CSS variables added to globals.css, utils.ts created.

- [ ] **Step 2: Verify tsconfig paths include cn/utils alias**

Read `tsconfig.json`, confirm paths include:
```json
"@/*": ["./src/*"]
```
And check `src/lib/utils.ts` exists with `cn` helper.

- [ ] **Step 3: Add shadcn components**

Run:
```bash
npx shadcn@latest add button input label card table dialog form
```

Expected: Components added to `src/components/ui/`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: setup shadcn/ui with core components"
```

---

### Task 6: Setup UploadThing

**Files:**
- Create: `src/lib/uploadthing.ts`, `src/app/api/uploadthing/route.ts`

- [ ] **Step 1: Create UploadThing router**

Write `src/lib/uploadthing.ts`:
```typescript
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
```

- [ ] **Step 2: Create UploadThing API handler**

Write `src/app/api/uploadthing/route.ts`:
```typescript
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
```

- [ ] **Step 3: Create UploadThing core router**

Write `src/app/api/uploadthing/core.ts`:
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  photoUploader: f({ image: { maxFileSize: "4MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
  qrUploader: f({ image: { maxFileSize: "1MB" } })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: setup uploadthing router and api handler"
```

---

### Task 7: Create Members API — GET List & POST Create

**Files:**
- Create: `src/app/api/members/route.ts`

- [ ] **Step 1: Create members API route with GET and POST**

Write `src/app/api/members/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const result = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member: result[0] });
  }

  const allMembers = await db.select().from(members).orderBy(members.createdAt);
  return NextResponse.json({ members: allMembers });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, name, email, photoUrl, qrCodeUrl } = body;

  if (!userId || !name) {
    return NextResponse.json(
      { error: "userId and name are required" },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Member with this userId already exists" },
      { status: 409 }
    );
  }

  const [member] = await db
    .insert(members)
    .values({ userId, name, email: email || null, photoUrl: photoUrl || null, qrCodeUrl: qrCodeUrl || null })
    .returning();

  return NextResponse.json({ member }, { status: 201 });
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add members api GET list and POST create"
```

---

### Task 8: Create Members API — PUT & DELETE by ID

**Files:**
- Create: `src/app/api/members/[id]/route.ts`

- [ ] **Step 1: Create members by ID API route**

Write `src/app/api/members/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, email, photoUrl, qrCodeUrl } = body;

  const [member] = await db
    .update(members)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(qrCodeUrl !== undefined && { qrCodeUrl }),
      updatedAt: new Date(),
    })
    .where(eq(members.id, parseInt(id)))
    .returning();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ member });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [member] = await db
    .delete(members)
    .where(eq(members.id, parseInt(id)))
    .returning();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add members api PUT and DELETE by id"
```

---

### Task 9: Create QR Generation Helper

**Files:**
- Create: `src/lib/qr.ts`

- [ ] **Step 1: Write QR generation helper**

Write `src/lib/qr.ts`:
```typescript
import QRCode from "qrcode";

export async function generateQRCode(
  userId: string,
  name: string
): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const encodedName = encodeURIComponent(name);
  const qrContent = `${baseUrl}/scan?userId=${userId}&name=${encodedName}`;

  const buffer = await QRCode.toBuffer(qrContent, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return buffer;
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add qr code generation helper"
```

---

### Task 10: Create Absensi API Client

**Files:**
- Create: `src/lib/absensi.ts`

- [ ] **Step 1: Write absensi API client**

Write `src/lib/absensi.ts`:
```typescript
const ABSENSI_BASE = process.env.ABSENSI_BASE_URL || "http://localhost:3004";
const API_KEY = process.env.ABSENSI_API_KEY || "";

export interface AutoCheckInResponse {
  success: boolean;
  message: string;
}

export async function autoCheckIn(
  userId: string,
  latitude: number,
  longitude: number,
  accuracy: number
): Promise<AutoCheckInResponse> {
  const res = await fetch(
    `${ABSENSI_BASE}/api/external/attendance/auto-checkin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ userId, latitude, longitude, accuracy }),
    }
  );

  return res.json();
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add absensi external api client"
```

---

### Task 11: Build Scan Page — Server Component

**Files:**
- Create: `src/app/scan/page.tsx`

- [ ] **Step 1: Write scan page (server component for initial fetch)**

Write `src/app/scan/page.tsx`:
```tsx
import { ScanView } from "@/components/scan-view";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; name?: string }>;
}) {
  const { userId, name } = await searchParams;

  if (!userId || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid QR Code</h1>
          <p className="text-gray-600 mt-2">Missing userId or name parameter.</p>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let member: { photoUrl?: string | null; name: string } | null = null;
  let fetchError: string | null = null;

  try {
    const res = await fetch(
      `${baseUrl}/api/members?userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();
      member = data.member;
    } else if (res.status === 404) {
      fetchError = "Member tidak ditemukan.";
    } else {
      fetchError = "Gagal mengambil data member.";
    }
  } catch {
    fetchError = "Gagal terhubung ke server.";
  }

  return (
    <ScanView
      userId={userId}
      name={decodeURIComponent(name)}
      photoUrl={member?.photoUrl || null}
      dbName={member?.name || null}
      fetchError={fetchError}
    />
  );
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors (ScanView not yet created — expect error, will resolve in next task).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add scan page server component"
```

---

### Task 12: Build Scan View Component (Client)

**Files:**
- Create: `src/components/scan-view.tsx`

- [ ] **Step 1: Write scan-view client component**

Write `src/components/scan-view.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { autoCheckIn } from "@/lib/absensi";

type Props = {
  userId: string;
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
            userId,
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

          {status.type !== "success" && (
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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add scan view client component with gps and attendance flow"
```

---

### Task 13: Build Dashboard Login Page

**Files:**
- Create: `src/app/dashboard/login/page.tsx`

- [ ] **Step 1: Write login page**

Write `src/app/dashboard/login/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("Password salah.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memeriksa..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create login API route**

Write `src/app/api/auth/login/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", adminPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add dashboard login page and auth api"
```

---

### Task 14: Build Dashboard Auth Guard Layout

**Files:**
- Create: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Write dashboard layout with auth guard**

Write `src/app/dashboard/layout.tsx`:
```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!token || token.value !== adminPassword) {
    redirect("/dashboard/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">QR Scanner Dashboard</h1>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create logout API route**

Write `src/app/api/auth/logout/route.ts`:
```typescript
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/dashboard/login");
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add dashboard auth guard layout and logout"
```

---

### Task 15: Build Member Table Component

**Files:**
- Create: `src/components/member-table.tsx`

- [ ] **Step 1: Write member table component**

Write `src/components/member-table.tsx`:
```tsx
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
                {member.userId.substring(0, 8)}...
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
```

- [ ] **Step 2: Create types file**

Write `src/lib/types.ts`:
```typescript
export type Member = {
  id: number;
  userId: string;
  name: string;
  email: string | null;
  photoUrl: string | null;
  qrCodeUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add member table component and types"
```

---

### Task 16: Build Member Form Component

**Files:**
- Create: `src/components/member-form.tsx`

- [ ] **Step 1: Write member form component

Write `src/components/member-form.tsx`:
```tsx
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
  photoUrl: string;
};

export function MemberForm({ open, onClose, onSave, member }: Props) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [userId, setUserId] = useState(member?.userId || "");
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave({ name, email, userId, photoUrl });
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
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required={!member}
              disabled={!!member}
              placeholder="UUID dari absensi DB"
            />
          </div>
          <div className="space-y-2">
            <Label>Foto</Label>
            {photoUrl ? (
              <div className="flex items-center gap-2">
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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add member form component with uploadthing"
```

---

### Task 17: Build QR Display Component

**Files:**
- Create: `src/components/qr-display.tsx`

- [ ] **Step 1: Write QR display component**

Write `src/components/qr-display.tsx`:
```tsx
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
  const scanUrl = `${baseUrl}/scan?userId=${member.userId}&name=${encodedName}`;

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
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add qr display component"
```

---

### Task 18: Build Dashboard Page (Integration)

**Files:**
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Write dashboard page server component with client wrapper**

Write `src/app/dashboard/page.tsx`:
```tsx
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let members: any[] = [];
  let fetchError: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/members`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      members = data.members || [];
    } else {
      fetchError = "Gagal mengambil data member.";
    }
  } catch {
    fetchError = "Gagal terhubung ke server.";
  }

  return <DashboardClient initialMembers={members} fetchError={fetchError} />;
}
```

- [ ] **Step 2: Write dashboard client component**

Write `src/app/dashboard/dashboard-client.tsx`:
```tsx
"use client";

import { useState, useCallback } from "react";
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
  const [generatingQR, setGeneratingQR] = useState(false);

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

      // Auto-generate QR
      setGeneratingQR(true);
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
              m.id === newMember.id ? { ...m, qrCodeUrl: qrJson.qrCodeUrl } : m
            )
          );
        }
      } catch {
        console.error("Failed to generate QR");
      } finally {
        setGeneratingQR(false);
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
        <h2 className="text-lg font-semibold">Daftar Member ({members.length})</h2>
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
```

- [ ] **Step 3: Create QR generation API endpoint**

Write `src/app/api/members/qr/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateQRCode } from "@/lib/qr";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(request: NextRequest) {
  const { memberId } = await request.json();

  if (!memberId) {
    return NextResponse.json(
      { error: "memberId is required" },
      { status: 400 }
    );
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  try {
    const qrBuffer = await generateQRCode(member.userId, member.name);
    const file = new File([qrBuffer], `qr-${member.userId}.png`, {
      type: "image/png",
    });
    const uploadResult = await utapi.uploadFiles(file, { metadata: {} });

    if (uploadResult.error) {
      return NextResponse.json(
        { error: "Failed to upload QR" },
        { status: 500 }
      );
    }

    const qrCodeUrl = uploadResult.data.url;

    await db
      .update(members)
      .set({ qrCodeUrl, updatedAt: new Date() })
      .where(eq(members.id, memberId));

    return NextResponse.json({ qrCodeUrl });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "QR generation failed" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add dashboard page with member crud and qr generation"
```

---

### Task 19: Create Root Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write root page (redirect to scan or dashboard)**

Write `src/app/page.tsx`:
```tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">QR Scanner App</h1>
        <p className="text-gray-600 max-w-md">
          Sistem absensi berbasis QR code. Scan QR ID card untuk check-in,
          atau kelola member melalui dashboard admin.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard">Dashboard Admin</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add root landing page"
```

---

### Task 20: Final Verification

**Files:** None

- [ ] **Step 1: Run full type check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Run lint**

Run:
```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 3: Build production**

Run:
```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 4: Verify .env has all required variables**

Check `.env` (or create from `.env.example`) with actual values for:
- `DATABASE_URL`
- `ABSENSI_API_KEY`
- `ABSENSI_BASE_URL`
- `ADMIN_PASSWORD`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`
- `NEXT_PUBLIC_APP_URL`

- [ ] **Step 5: Verify database has members table**

Run:
```bash
npx drizzle-kit push
```

Expected: No changes to apply (already up to date).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: final verification"
```
