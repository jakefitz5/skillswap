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

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();

  const conversations = await db.all(
    `SELECT
      c.id,
      c.participant_1,
      c.participant_2,
      c.updated_at,
      CASE WHEN c.participant_1 = ? THEN c.participant_2 ELSE c.participant_1 END as other_user_id,
      CASE WHEN c.participant_1 = ? THEN u2.name ELSE u1.name END as other_user_name,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
    FROM conversations c
    JOIN users u1 ON u1.id = c.participant_1
    JOIN users u2 ON u2.id = c.participant_2
    WHERE c.participant_1 = ? OR c.participant_2 = ?
    ORDER BY c.updated_at DESC`,
    user.userId,
    user.userId,
    user.userId,
    user.userId,
    user.userId
  );

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { otherUserId } = await request.json();
  if (!otherUserId || otherUserId === user.userId) {
    return NextResponse.json({ error: "Invalid user" }, { status: 400 });
  }

  const db = await getDb();

  const p1 = Math.min(user.userId, otherUserId);
  const p2 = Math.max(user.userId, otherUserId);

  // Try to get existing conversation
  let conversation = await db.get(
    "SELECT * FROM conversations WHERE participant_1 = ? AND participant_2 = ?",
    p1,
    p2
  );

  if (!conversation) {
    const result = await db.run(
      "INSERT INTO conversations (participant_1, participant_2) VALUES (?, ?)",
      p1,
      p2
    );
    conversation = await db.get("SELECT * FROM conversations WHERE id = ?", result.lastInsertRowid);
  }

  return NextResponse.json({ conversation });
}
