import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}
