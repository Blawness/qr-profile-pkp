import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Wrench, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const legacyToken = cookieStore.get("admin_token");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const hasLegacyAuth = legacyToken && adminPassword && legacyToken.value === adminPassword;

  const sessionUser = cookieStore.get("session_username");
  const sessionRole = cookieStore.get("session_role");

  if (!hasLegacyAuth && (!sessionUser || !sessionRole)) {
    redirect("/login");
  }

  const role = sessionRole?.value || "admin";

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r flex flex-col shrink-0">
        <div className="px-5 py-4 border-b">
          <h1 className="text-sm font-bold text-primary uppercase tracking-wider">QR Scanner</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          {role === "admin" && (
            <>
              <Link
                href="/dashboard/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Users className="w-4 h-4" />
                Users
              </Link>
              <Link
                href="/dashboard/developer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Developer
              </Link>
            </>
          )}
        </nav>

        <div className="p-3 border-t">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-medium text-gray-600">Dashboard</h2>
          <span className="text-[11px] text-gray-400">
            {sessionUser?.value || "Admin"} &middot; {role}
          </span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
