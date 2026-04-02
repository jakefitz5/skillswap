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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();
  const db = await getDb();

  const booking = await db.get(
    `SELECT lb.*, lr.teacher_id, lr.student_id
     FROM lesson_bookings lb
     JOIN lesson_requests lr ON lr.id = lb.lesson_request_id
     WHERE lb.id = ?`,
    Number(id)
  );

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isTeacher = user.userId === (booking.teacher_id as number);
  const isStudent = user.userId === (booking.student_id as number);

  if (!isTeacher && !isStudent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (status === "cancelled" && (booking.status as string) === "upcoming") {
    await db.run(
      "UPDATE lesson_bookings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?",
      Number(id)
    );
    return NextResponse.json({ success: true });
  }

  if (status === "completed" && isTeacher && (booking.status as string) === "upcoming") {
    await db.run(
      "UPDATE lesson_bookings SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
      Number(id)
    );
    await db.run(
      "UPDATE lesson_requests SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
      booking.lesson_request_id
    );
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
}
