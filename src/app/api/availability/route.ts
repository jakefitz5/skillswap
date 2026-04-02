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
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const profile = await db.get(
    "SELECT id FROM teacher_profiles WHERE user_id = ?",
    user.userId
  );

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const slots = await db.all(
    "SELECT * FROM teacher_availability_slots WHERE teacher_profile_id = ? ORDER BY day_of_week, start_time",
    profile.id
  );

  return NextResponse.json({ slots });
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const profile = (await db.get(
    "SELECT id FROM teacher_profiles WHERE user_id = ?",
    user.userId
  )) as { id: number } | undefined;

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { slots } = await request.json();

  await db.run(
    "DELETE FROM teacher_availability_slots WHERE teacher_profile_id = ?",
    profile.id
  );

  if (slots && Array.isArray(slots)) {
    for (const slot of slots) {
      if (slot.day_of_week != null && slot.start_time && slot.end_time) {
        await db.run(
          "INSERT OR IGNORE INTO teacher_availability_slots (teacher_profile_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)",
          profile.id,
          slot.day_of_week,
          slot.start_time,
          slot.end_time
        );
      }
    }
  }

  return NextResponse.json({ success: true });
}
