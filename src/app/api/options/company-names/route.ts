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
      SELECT company_name, COUNT(*) as domain_count
      FROM domains 
      WHERE company_name IS NOT NULL AND company_name != ''
    `;

    const queryParams: any[] = [];

    // Add search condition if provided
    if (search.trim()) {
      query += ` AND company_name LIKE ?`;
      queryParams.push(`%${search.trim()}%`);
    }

    query += `
      GROUP BY company_name
      ORDER BY domain_count DESC, company_name ASC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const companies = db.prepare(query).all(...queryParams) as Array<{
      company_name: string;
      domain_count: number;
    }>;

    // For dropdown, return simple array of company names
    const companyList = companies.map((item) => item.company_name);

    return NextResponse.json(companyList, { status: 200 });
  } catch (error) {
    console.error("Company Names API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch company names",
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
