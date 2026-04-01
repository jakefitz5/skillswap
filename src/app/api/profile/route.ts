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
    "SELECT * FROM teacher_profiles WHERE user_id = ?",
    user.userId
  );

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const catRows = await db.all(
    "SELECT category_id FROM teacher_categories WHERE teacher_profile_id = ?",
    profile.id
  );
  const categoryIds = catRows.map((row) => row.category_id as number);

  return NextResponse.json({
    profile: {
      ...profile,
      skills: JSON.parse((profile.skills as string) || "[]"),
      availability: JSON.parse((profile.availability as string) || "[]"),
      categoryIds,
    },
  });
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "teacher") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      bio,
      hourlyRate,
      skills,
      categoryIds,
      availability,
      location,
      experienceLevel,
      isPublished,
    } = body;

    const db = await getDb();

    const profile = (await db.get(
      "SELECT id FROM teacher_profiles WHERE user_id = ?",
      user.userId
    )) as { id: number } | undefined;

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.run(
      `UPDATE teacher_profiles SET
        bio = ?,
        hourly_rate = ?,
        skills = ?,
        availability = ?,
        location = ?,
        experience_level = ?,
        is_published = ?,
        updated_at = datetime('now')
      WHERE user_id = ?`,
      bio || "",
      hourlyRate || 0,
      JSON.stringify(skills || []),
      JSON.stringify(availability || []),
      location || "",
      experienceLevel || "beginner",
      isPublished ? 1 : 0,
      user.userId
    );

    await db.run(
      "DELETE FROM teacher_categories WHERE teacher_profile_id = ?",
      profile.id
    );

    if (categoryIds && Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        await db.run(
          "INSERT INTO teacher_categories (teacher_profile_id, category_id) VALUES (?, ?)",
          profile.id,
          catId
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
