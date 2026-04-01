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

  const lessonRequest = (await db.get(
    "SELECT * FROM lesson_requests WHERE id = ?",
    Number(id)
  )) as { teacher_id: number; student_id: number; status: string } | undefined;

  if (!lessonRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (user.role === "teacher" && lessonRequest.teacher_id === user.userId) {
    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "declined"],
      accepted: ["completed"],
    };

    const allowed = validTransitions[lessonRequest.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${lessonRequest.status} to ${status}` },
        { status: 400 }
      );
    }
  } else if (user.role === "student" && lessonRequest.student_id === user.userId) {
    if (lessonRequest.status !== "pending" || status !== "cancelled") {
      return NextResponse.json(
        { error: "Can only cancel pending requests" },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.run(
    "UPDATE lesson_requests SET status = ?, updated_at = datetime('now') WHERE id = ?",
    status,
    Number(id)
  );

  return NextResponse.json({ success: true });
}
