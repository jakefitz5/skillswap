import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

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
  const status = searchParams.get("status");

  const db = await getDb();

  let query: string;
  const params: (string | number)[] = [];

  if (user.role === "teacher") {
    query = `
      SELECT lr.*, u.name as student_display_name
      FROM lesson_requests lr
      JOIN users u ON u.id = lr.student_id
      WHERE lr.teacher_id = ?
    `;
    params.push(user.userId);
  } else {
    query = `
      SELECT lr.*, u.name as teacher_name
      FROM lesson_requests lr
      JOIN users u ON u.id = lr.teacher_id
      WHERE lr.student_id = ?
    `;
    params.push(user.userId);
  }

  if (status) {
    query += " AND lr.status = ?";
    params.push(status);
  }

  query += " ORDER BY lr.created_at DESC";

  const requests = await db.all(query, ...params);

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { teacherId, message, preferredTime } = await request.json();

    if (!teacherId || !message || !preferredTime) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const teacher = await db.get(
      "SELECT tp.id FROM teacher_profiles tp WHERE tp.user_id = ? AND tp.is_published = 1",
      teacherId
    );

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    const result = await db.run(
      `INSERT INTO lesson_requests (student_id, teacher_id, student_name, message, preferred_time)
       VALUES (?, ?, ?, ?, ?)`,
      user.userId,
      teacherId,
      user.name,
      message,
      preferredTime
    );

    await createNotification(db, {
      userId: teacherId,
      type: "lesson_request",
      title: "New Lesson Request",
      message: `${user.name} wants to take a lesson with you`,
      link: "/dashboard/teacher",
    });

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
