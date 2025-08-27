import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data", "builtwith.db");
    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = 1000000");
    db.pragma("temp_store = MEMORY");
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// Graceful shutdown
process.on("exit", closeDatabase);
process.on("SIGINT", closeDatabase);
process.on("SIGTERM", closeDatabase);
