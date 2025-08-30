import { NextResponse } from "next/server";
import { DatabaseSchema } from "@/lib/database/schema";

export async function GET() {
  let dbSchema: DatabaseSchema | null = null;

  try {
    // Initialize database connection
    dbSchema = new DatabaseSchema();
    const db = dbSchema.getDatabase();

    // Query distinct categories with counts
    const query = `
      SELECT category, COUNT(*) as count
      FROM domains 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC, category ASC
    `;

    const categories = db.prepare(query).all() as Array<{
      category: string;
      count: number;
    }>;

    // Return simple array of category names for dropdown
    const categoryList = categories.map((item) => item.category);

    return NextResponse.json(categoryList, { status: 200 });
  } catch (error) {
    console.error("Categories API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    // Ensure database connection is closed
    if (dbSchema) {
      dbSchema.close();
    }
  }
}
