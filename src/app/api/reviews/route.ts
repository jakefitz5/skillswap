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
  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required" },
      { status: 400 }
    );
  }

  const db = await getDb();

  const reviews = await db.all(
    `SELECT r.*, u.name as reviewer_name
     FROM reviews r
     JOIN users u ON u.id = r.student_id
     WHERE r.teacher_id = ?
     ORDER BY r.created_at DESC`,
    Number(teacherId)
  );

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lessonRequestId, rating, comment } = await request.json();

    if (!lessonRequestId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Valid lessonRequestId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const lessonRequest = (await db.get(
      "SELECT * FROM lesson_requests WHERE id = ? AND student_id = ?",
      lessonRequestId,
      user.userId
    )) as { status: string; teacher_id: number } | undefined;

    if (!lessonRequest) {
      return NextResponse.json(
        { error: "Lesson request not found" },
        { status: 404 }
      );
    }

    if (lessonRequest.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed lessons" },
        { status: 400 }
      );
    }

    const existing = await db.get(
      "SELECT id FROM reviews WHERE lesson_request_id = ?",
      lessonRequestId
    );

    if (existing) {
      return NextResponse.json(
        { error: "Already reviewed this lesson" },
        { status: 409 }
      );
    }

    const result = await db.run(
      `INSERT INTO reviews (lesson_request_id, student_id, teacher_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`,
      lessonRequestId,
      user.userId,
      lessonRequest.teacher_id,
      rating,
      comment || ""
    );

    return NextResponse.json(
      { id: result.lastInsertRowid, success: true },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
