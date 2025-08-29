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
export const RangeFilterSchema = <T extends z.ZodNumber>(numSchema: T) =>
  z.object({
    min: numSchema.optional(),
    max: numSchema.optional(),
    inclusive: z.boolean().optional().default(true),
  });

// Technology category filter with count requirements
export const TechnologyCategoryFilterSchema = z.object({
  category: z.string(),
  minCount: z.number().int().min(0).optional(),
  maxCount: z.number().int().min(0).optional(),

  // If you use OR anywhere, you want an inclusive
  // search otherwise, you want a restrictive search
  operator: z.enum(["AND", "OR", "NOT"]).default("AND"),
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
  totalSpendRange: RangeFilterSchema(z.number()).optional(),
  technologyCountRange: RangeFilterSchema(z.number().int()).optional(),
});

export type StringFilter = {
  value: string;
  matchType?: "exact" | "contains" | "startsWith" | "endsWith";
  caseSensitive?: boolean;
};

export type LogicalFilter<T> = {
  include?: T[];
  exclude?: T[];
  requireAll?: T[];
  isMultiValue?: boolean;
};

export type RangeFilter<T extends number> = {
  min?: T;
  max?: T;
  inclusive?: boolean;
};

export type TechnologyCategoryFilter = {
  category: string;
  minCount?: number;
  maxCount?: number;
  operator?: "AND" | "OR" | "NOT";
};

export type DomainSearch = {
  domain?: StringFilter;
  companyName?: StringFilter;
  category?: LogicalFilter<string>;
  country?: LogicalFilter<string>;
  technologies?: LogicalFilter<string>;
  technologyCategories?: TechnologyCategoryFilter[];
  totalSpendRange?: RangeFilter<number>;
  technologyCountRange?: RangeFilter<number>;
};
