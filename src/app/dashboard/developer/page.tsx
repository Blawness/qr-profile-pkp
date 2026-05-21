import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DeveloperClient } from "./developer-client";

export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const cookieStore = await cookies();
  const sessionRole = cookieStore.get("session_role");

  const legacyToken = cookieStore.get("admin_token");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const hasLegacyAuth = legacyToken && adminPassword && legacyToken.value === adminPassword;

  if (!hasLegacyAuth && sessionRole?.value !== "admin") {
    redirect("/dashboard");
  }

  return <DeveloperClient />;
}
