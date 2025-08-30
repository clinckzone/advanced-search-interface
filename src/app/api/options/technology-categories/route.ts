import { NextResponse } from "next/server";
import { DatabaseSchema } from "@/lib/database/schema";

export async function GET() {
  let dbSchema: DatabaseSchema | null = null;

  try {
    // Initialize database connection
    dbSchema = new DatabaseSchema();
    const db = dbSchema.getDatabase();

    // Query distinct technology categories with counts
    const query = `
      SELECT category, COUNT(*) as count
      FROM technologies 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC, category ASC
    `;

    const techCategories = db.prepare(query).all() as Array<{
      category: string;
      count: number;
    }>;

    // Return simple array of technology category names for dropdown
    const techCategoryList = techCategories.map((item) => item.category);

    return NextResponse.json(techCategoryList, { status: 200 });
  } catch (error) {
    console.error("Technology Categories API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch technology categories",
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
