import type { DbWrapper } from "./db";

export async function createNotification(
  db: DbWrapper,
  params: {
    userId: number;
    type: string;
    title: string;
    message?: string;
    link?: string;
  }
): Promise<void> {
  await db.run(
    "INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)",
    params.userId,
    params.type,
    params.title,
    params.message || "",
    params.link || ""
  );
}
