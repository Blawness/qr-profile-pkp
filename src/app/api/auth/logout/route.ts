import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("session_username");
  cookieStore.delete("session_role");
  redirect("/login");
}
