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
  const upcoming = searchParams.get("upcoming") === "true";

  const db = await getDb();

  let query: string;
  if (user.role === "teacher") {
    query = `
      SELECT lb.*, lr.student_id, lr.teacher_id, lr.message, u.name as other_name
      FROM lesson_bookings lb
      JOIN lesson_requests lr ON lr.id = lb.lesson_request_id
      JOIN users u ON u.id = lr.student_id
      WHERE lr.teacher_id = ?
    `;
  } else {
    query = `
      SELECT lb.*, lr.student_id, lr.teacher_id, lr.message, u.name as other_name
      FROM lesson_bookings lb
      JOIN lesson_requests lr ON lr.id = lb.lesson_request_id
      JOIN users u ON u.id = lr.teacher_id
      WHERE lr.student_id = ?
    `;
  }

  if (upcoming) {
    query += " AND lb.status = 'upcoming' AND lb.scheduled_date >= date('now')";
  }

  query += " ORDER BY lb.scheduled_date ASC, lb.scheduled_time ASC";

  const bookings = await db.all(query, user.userId);

  return NextResponse.json({ bookings });
}
