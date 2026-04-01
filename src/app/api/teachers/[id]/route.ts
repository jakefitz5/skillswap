import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const teacher = await db.get(
    `SELECT
      tp.id,
      tp.user_id,
      u.name,
      u.email,
      tp.bio,
      tp.hourly_rate,
      tp.experience_level,
      tp.location,
      tp.skills,
      tp.availability,
      tp.is_published,
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM teacher_profiles tp
    JOIN users u ON u.id = tp.user_id
    LEFT JOIN reviews r ON r.teacher_id = tp.user_id
    WHERE tp.user_id = ? AND tp.is_published = 1
    GROUP BY tp.id`,
    Number(id)
  );

  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const categories = await db.all(
    `SELECT c.* FROM categories c
     JOIN teacher_categories tc ON tc.category_id = c.id
     WHERE tc.teacher_profile_id = ?`,
    teacher.id as number
  );

  const reviews = await db.all(
    `SELECT r.*, u.name as reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.student_id
     WHERE r.teacher_id = ?
     ORDER BY r.created_at DESC`,
    Number(id)
  );

  return NextResponse.json({
    teacher: {
      ...teacher,
      skills: JSON.parse((teacher.skills as string) || "[]"),
      availability: JSON.parse((teacher.availability as string) || "[]"),
      avg_rating: (teacher.avg_rating as number)
        ? Math.round((teacher.avg_rating as number) * 10) / 10
        : null,
      categories,
      reviews,
    },
  });
}
