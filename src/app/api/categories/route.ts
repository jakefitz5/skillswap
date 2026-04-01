import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const categories = await db.all("SELECT * FROM categories ORDER BY name");
  return NextResponse.json({ categories });
}
