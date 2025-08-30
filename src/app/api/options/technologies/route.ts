import { NextRequest, NextResponse } from "next/server";
import { DatabaseSchema } from "@/lib/database/schema";

export async function GET(request: NextRequest) {
  let dbSchema: DatabaseSchema | null = null;

  try {
    // Initialize database connection
    dbSchema = new DatabaseSchema();
    const db = dbSchema.getDatabase();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Build query with optional search
    let query = `
      SELECT name, category, COUNT(*) as usage_count
      FROM technologies t
      LEFT JOIN domain_technologies dt ON t.id = dt.technology_id
      WHERE t.name IS NOT NULL AND t.name != ''
    `;

    const queryParams: any[] = [];

    // Add search condition if provided
    if (search.trim()) {
      query += ` AND t.name LIKE ?`;
      queryParams.push(`%${search.trim()}%`);
    }

    query += `
      GROUP BY t.name, t.category
      ORDER BY usage_count DESC, t.name ASC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const technologies = db.prepare(query).all(...queryParams) as Array<{
      name: string;
      category: string;
      usage_count: number;
    }>;

    // For dropdown, return simple array of technology names
    const technologyList = technologies.map((item) => item.name);

    return NextResponse.json(technologyList, { status: 200 });
  } catch (error) {
    console.error("Technologies API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch technologies",
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
