import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unread = searchParams.get("unread") === "true";
  const limit = parseInt(searchParams.get("limit") || "20");

  const db = await getDb();

  let query = "SELECT * FROM notifications WHERE user_id = ?";
  if (unread) query += " AND is_read = 0";
  query += " ORDER BY created_at DESC LIMIT ?";

  const notifications = await db.all(query, user.userId, limit);

  return NextResponse.json({ notifications });
}
