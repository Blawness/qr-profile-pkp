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
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Dashboard Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
