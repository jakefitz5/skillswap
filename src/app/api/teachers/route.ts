import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const experience = searchParams.get("experience") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
  const sort = searchParams.get("sort") || "rating";
  const offset = (page - 1) * limit;

  const db = await getDb();

  const conditions: string[] = ["tp.is_published = 1"];
  const params: (string | number)[] = [];

  if (q) {
    conditions.push("(u.name LIKE ? OR tp.skills LIKE ? OR tp.bio LIKE ?)");
    const pattern = `%${q}%`;
    params.push(pattern, pattern, pattern);
  }

  if (category) {
    conditions.push(
      "EXISTS (SELECT 1 FROM teacher_categories tc JOIN categories c ON c.id = tc.category_id WHERE tc.teacher_profile_id = tp.id AND c.slug = ?)"
    );
    params.push(category);
  }

  if (minPrice) {
    conditions.push("tp.hourly_rate >= ?");
    params.push(Number(minPrice));
  }

  if (maxPrice) {
    conditions.push("tp.hourly_rate <= ?");
    params.push(Number(maxPrice));
  }

  if (experience) {
    conditions.push("tp.experience_level = ?");
    params.push(experience);
  }

  const whereClause = conditions.length
    ? "WHERE " + conditions.join(" AND ")
    : "";

  let orderBy = "ORDER BY avg_rating DESC NULLS LAST";
  if (sort === "rate_asc") orderBy = "ORDER BY tp.hourly_rate ASC";
  else if (sort === "rate_desc") orderBy = "ORDER BY tp.hourly_rate DESC";
  else if (sort === "newest") orderBy = "ORDER BY tp.created_at DESC";

  const totalRow = await db.get(
    `SELECT COUNT(DISTINCT tp.id) as total
     FROM teacher_profiles tp
     JOIN users u ON u.id = tp.user_id
     ${whereClause}`,
    ...params
  );
  const total = (totalRow?.total as number) || 0;

  const rows = await db.all(
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
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(DISTINCT r.id) as review_count
    FROM teacher_profiles tp
    JOIN users u ON u.id = tp.user_id
    LEFT JOIN reviews r ON r.teacher_id = tp.user_id
    ${whereClause}
    GROUP BY tp.id
    ${orderBy}
    LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset
  );

  const teachers = [];
  for (const t of rows) {
    const categories = await db.all(
      `SELECT c.* FROM categories c
       JOIN teacher_categories tc ON tc.category_id = c.id
       WHERE tc.teacher_profile_id = ?`,
      t.id
    );

    teachers.push({
      ...t,
      skills: JSON.parse((t.skills as string) || "[]"),
      availability: JSON.parse((t.availability as string) || "[]"),
      avg_rating: (t.avg_rating as number)
        ? Math.round((t.avg_rating as number) * 10) / 10
        : null,
      categories,
    });
  }

  return NextResponse.json({
    teachers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
