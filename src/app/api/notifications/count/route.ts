import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ count: 0 });

  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ count: 0 });

  const db = await getDb();
  const result = await db.get(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
    user.userId
  );

  return NextResponse.json({ count: (result?.count as number) || 0 });
}
