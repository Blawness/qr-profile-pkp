import { DashboardClient } from "./dashboard-client";
import { db } from "@/db";
import { members } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let memberList: typeof members.$inferSelect[] = [];
  let fetchError: string | null = null;

  try {
    memberList = await db.select().from(members).orderBy(members.createdAt);
  } catch {
    fetchError = "Gagal mengambil data member.";
  }

  return <DashboardClient initialMembers={memberList} fetchError={fetchError} />;
}
