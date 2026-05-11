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
    redirect("/login");
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
