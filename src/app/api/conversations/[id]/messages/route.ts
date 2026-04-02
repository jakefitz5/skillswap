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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = await getDb();

  // Verify participant
  const conversation = await db.get(
    "SELECT * FROM conversations WHERE id = ? AND (participant_1 = ? OR participant_2 = ?)",
    Number(id),
    user.userId,
    user.userId
  );

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark messages from other user as read
  await db.run(
    "UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ? AND is_read = 0",
    Number(id),
    user.userId
  );

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  const messages = await db.all(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?",
    Number(id),
    limit
  );

  return NextResponse.json({ messages: messages.reverse() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await request.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const db = await getDb();

  const conversation = await db.get(
    "SELECT * FROM conversations WHERE id = ? AND (participant_1 = ? OR participant_2 = ?)",
    Number(id),
    user.userId,
    user.userId
  );

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await db.run(
    "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
    Number(id),
    user.userId,
    content.trim()
  );

  await db.run(
    "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
    Number(id)
  );

  return NextResponse.json({ id: result.lastInsertRowid, success: true }, { status: 201 });
}
