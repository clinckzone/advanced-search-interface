import { z } from "zod";

// String filter for domain/company name matching
export const StringFilterSchema = z.object({
  value: z.string(),
  matchType: z.enum(["exact", "contains", "startsWith", "endsWith"]).optional().default("contains"),
  caseSensitive: z.boolean().optional().default(false),
});

// Logical filter for AND/OR/NOT operations on arrays
export const LogicalFilterSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    include: z.array(itemSchema).optional(), // OR operation - match any of these values
    exclude: z.array(itemSchema).optional(), // NOT operation - exclude all these values
    requireAll: z.array(itemSchema).optional(), // AND operation - must match all these values
    isMultiValue: z.boolean().default(false), // Whether the field supports multiple values
  });

// Range filter for numeric values
export const RangeFilterSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  inclusive: z.boolean().optional().default(true),
});

// Technology category filter with count requirements
export const TechnologyCategoryFilterSchema = z.object({
  category: z.string(),
  minCount: z.number().int().min(0).optional(),
  maxCount: z.number().int().min(0).optional(),

  // Set true if you want to exclude this category
  exclude: z.boolean().optional().default(false),
});

// Schema for validating QueryBuilderOptions
export const DomainSearchOptionsSchema = z.object({
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional(),
});

// Domain search schema
export const DomainSearchSchema = z.object({
  // Basic domain search criteria
  domain: StringFilterSchema.optional(),
  companyName: StringFilterSchema.optional(),
  category: LogicalFilterSchema(z.string()).optional(),
  country: LogicalFilterSchema(z.string()).optional(),

  // Technology-based search
  technologies: LogicalFilterSchema(z.string()).optional(),

  // Technology categories with count requirements
  technologyCategories: z.array(TechnologyCategoryFilterSchema).optional(),

  // Numeric range filters
  totalSpendRange: RangeFilterSchema.optional(),
  technologyCountRange: RangeFilterSchema.optional(),
});

// Domain search request schema
export const DomainSearchRequestSchema = z.object({
  searchParams: DomainSearchSchema,
  options: DomainSearchOptionsSchema.optional(),
});

// Inferred types from Zod schemas - single source of truth
export type StringFilter = z.infer<typeof StringFilterSchema>;
export type LogicalFilter<T> = z.infer<ReturnType<typeof LogicalFilterSchema<z.ZodType<T>>>>;
export type RangeFilter = z.infer<typeof RangeFilterSchema>;
export type TechnologyCategoryFilter = z.infer<typeof TechnologyCategoryFilterSchema>;

export type DomainSearch = z.infer<typeof DomainSearchSchema>;
export type DomainSearchOptions = z.infer<typeof DomainSearchOptionsSchema>;
export type DomainSearchRequest = z.infer<typeof DomainSearchRequestSchema>;
