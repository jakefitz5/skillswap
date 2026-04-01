import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  const steps: string[] = [];
  try {
    steps.push("1. Getting db...");
    const db = await getDb();
    steps.push("2. Got db");

    steps.push("3. Hashing password...");
    const hash = hashPassword("test123");
    steps.push("4. Hashed: " + hash.substring(0, 10) + "...");

    steps.push("5. Inserting user...");
    const result = await db.run(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      "Debug User",
      "debug" + Date.now() + "@test.com",
      hash,
      "teacher"
    );
    steps.push("6. Insert result: " + JSON.stringify(result));

    const userId = Number(result.lastInsertRowid);
    steps.push("7. userId: " + userId);

    steps.push("8. Creating teacher profile...");
    await db.run("INSERT INTO teacher_profiles (user_id) VALUES (?)", userId);
    steps.push("9. Done!");

    return NextResponse.json({ success: true, steps });
  } catch (err: unknown) {
    const error = err as Error;
    steps.push("ERROR: " + error.message);
    steps.push("STACK: " + error.stack);
    return NextResponse.json({ success: false, steps, error: error.message }, { status: 500 });
  }
}
