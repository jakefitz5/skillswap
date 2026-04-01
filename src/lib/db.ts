import { SEED_CATEGORIES } from "./constants";

// Check at runtime, not module load time
function isTurso(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

// ─── Turso (production) ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tursoClient: any = null;

async function getTursoClient() {
  if (tursoClient) return tursoClient;
  const { createClient } = await import("@libsql/client/web");
  tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL!.replace("libsql://", "https://"),
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
  return tursoClient;
}

// ─── Unified DB wrapper ───────────────────────────────────────────────
// Wraps either better-sqlite3 (sync) or Turso (async) behind a single
// async interface used by all API routes and server components.

export interface DbRow {
  [key: string]: unknown;
}

export interface DbRunResult {
  lastInsertRowid: number | bigint;
  changes: number;
}

export interface DbWrapper {
  get(sql: string, ...params: unknown[]): Promise<DbRow | undefined>;
  all(sql: string, ...params: unknown[]): Promise<DbRow[]>;
  run(sql: string, ...params: unknown[]): Promise<DbRunResult>;
  exec(sql: string): Promise<void>;
  transaction(fn: () => Promise<void>): Promise<void>;
}

// ─── better-sqlite3 wrapper ───────────────────────────────────────────

async function createSqliteWrapper(): Promise<DbWrapper> {
  const Database = (await import("better-sqlite3")).default;
  const path = await import("path");
  const dbPath = path.resolve(process.env.DATABASE_PATH || "./data/skillswap.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  return {
    async get(sql, ...params) {
      return db.prepare(sql).get(...params) as DbRow | undefined;
    },
    async all(sql, ...params) {
      return db.prepare(sql).all(...params) as DbRow[];
    },
    async run(sql, ...params) {
      const result = db.prepare(sql).run(...params);
      return {
        lastInsertRowid: result.lastInsertRowid,
        changes: result.changes,
      };
    },
    async exec(sql) {
      db.exec(sql);
    },
    async transaction(fn) {
      const t = db.transaction(() => {
        // We need to run the async function synchronously here
        // This works because all the inner calls go through the same sync db
      });
      // For sqlite, just run directly since it's all sync anyway
      await fn();
    },
  };
}

// ─── Turso wrapper ────────────────────────────────────────────────────

async function createTursoWrapper(): Promise<DbWrapper> {
  const client = await getTursoClient();

  return {
    async get(sql, ...params) {
      const result = await client.execute(sql, params);
      return (result.rows[0] as DbRow) || undefined;
    },
    async all(sql, ...params) {
      const result = await client.execute(sql, params);
      return result.rows as DbRow[];
    },
    async run(sql, ...params) {
      const result = await client.execute(sql, params);
      return {
        lastInsertRowid: Number(result.lastInsertRowid ?? 0),
        changes: result.rowsAffected ?? 0,
      };
    },
    async exec(sql) {
      // Split by semicolons for multi-statement exec
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await client.execute(stmt);
      }
    },
    async transaction(fn) {
      // Turso doesn't have real transactions via HTTP, just run sequentially
      await fn();
    },
  };
}

// ─── Schema + seeding ─────────────────────────────────────────────────

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    name            TEXT    NOT NULL,
    role            TEXT    NOT NULL CHECK (role IN ('teacher', 'student')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS teacher_profiles (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL UNIQUE REFERENCES users(id),
    bio              TEXT    DEFAULT '',
    hourly_rate      REAL    NOT NULL DEFAULT 0,
    experience_level TEXT    NOT NULL DEFAULT 'beginner'
                            CHECK (experience_level IN ('beginner','intermediate','advanced','expert')),
    location         TEXT    DEFAULT '',
    availability     TEXT    DEFAULT '[]',
    skills           TEXT    DEFAULT '[]',
    is_published     INTEGER NOT NULL DEFAULT 0,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS teacher_categories (
    teacher_profile_id INTEGER NOT NULL REFERENCES teacher_profiles(id),
    category_id        INTEGER NOT NULL REFERENCES categories(id),
    PRIMARY KEY (teacher_profile_id, category_id)
  );

  CREATE TABLE IF NOT EXISTS lesson_requests (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id     INTEGER NOT NULL REFERENCES users(id),
    teacher_id     INTEGER NOT NULL REFERENCES users(id),
    student_name   TEXT    NOT NULL,
    message        TEXT    NOT NULL,
    preferred_time TEXT    NOT NULL,
    status         TEXT    NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','accepted','declined','completed','cancelled')),
    created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_request_id INTEGER NOT NULL REFERENCES lesson_requests(id),
    student_id        INTEGER NOT NULL REFERENCES users(id),
    teacher_id        INTEGER NOT NULL REFERENCES users(id),
    rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment           TEXT    DEFAULT '',
    created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(lesson_request_id)
  );

  CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
  CREATE INDEX IF NOT EXISTS idx_teacher_profiles_published ON teacher_profiles(is_published);
  CREATE INDEX IF NOT EXISTS idx_lesson_requests_student_id ON lesson_requests(student_id);
  CREATE INDEX IF NOT EXISTS idx_lesson_requests_teacher_id ON lesson_requests(teacher_id);
  CREATE INDEX IF NOT EXISTS idx_lesson_requests_status ON lesson_requests(status);
  CREATE INDEX IF NOT EXISTS idx_reviews_teacher_id ON reviews(teacher_id);
`;

async function initDb(db: DbWrapper) {
  await db.exec(SCHEMA);

  // Seed categories
  for (const cat of SEED_CATEGORIES) {
    await db.run(
      "INSERT OR IGNORE INTO categories (name, slug, icon) VALUES (?, ?, ?)",
      cat.name,
      cat.slug,
      cat.icon
    );
  }
}

// ─── Singleton ────────────────────────────────────────────────────────

const globalForDb = globalThis as unknown as {
  __db?: DbWrapper;
  __dbInit?: Promise<DbWrapper>;
};

export async function getDb(): Promise<DbWrapper> {
  if (globalForDb.__db) return globalForDb.__db;

  if (!globalForDb.__dbInit) {
    globalForDb.__dbInit = (async () => {
      const wrapper = isTurso()
        ? await createTursoWrapper()
        : await createSqliteWrapper();
      await initDb(wrapper);
      globalForDb.__db = wrapper;
      return wrapper;
    })();
  }

  return globalForDb.__dbInit;
}
