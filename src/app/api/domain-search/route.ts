import { QueryBuilder } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";
import { DomainSearchRequest, DomainSearchRequestSchema } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate request structure
    const validationResult = DomainSearchRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { searchParams, options }: DomainSearchRequest = validationResult.data;

    // Create QueryBuilder instance and execute unified search
    const queryBuilder = new QueryBuilder(searchParams);
    const searchResult = queryBuilder.executeSearch(options);

    // Return enriched data with total count
    return NextResponse.json(
      {
        data: searchResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Domain search API error:", error);

    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Search operation failed",
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
