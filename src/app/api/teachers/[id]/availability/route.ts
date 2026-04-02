import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const profile = await db.get(
    "SELECT id FROM teacher_profiles WHERE user_id = ? AND is_published = 1",
    Number(id)
  );

  if (!profile) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const slots = await db.all(
    "SELECT * FROM teacher_availability_slots WHERE teacher_profile_id = ? ORDER BY day_of_week, start_time",
    profile.id
  );

  return NextResponse.json({ slots });
}
