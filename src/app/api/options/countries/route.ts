import { NextResponse } from "next/server";
import { DatabaseSchema } from "@/lib/database/schema";

export async function GET() {
  let dbSchema: DatabaseSchema | null = null;

  try {
    // Initialize database connection
    dbSchema = new DatabaseSchema();
    const db = dbSchema.getDatabase();

    // Query distinct countries with counts
    const query = `
      SELECT country, COUNT(*) as count
      FROM domains 
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country 
      ORDER BY count DESC, country ASC
    `;

    const countries = db.prepare(query).all() as Array<{
      country: string;
      count: number;
    }>;

    // Return simple array of country names for dropdown
    const countryList = countries.map((item) => item.country);

    return NextResponse.json(countryList, { status: 200 });
  } catch (error) {
    console.error("Countries API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch countries",
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
