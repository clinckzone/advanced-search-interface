import { z } from "zod";

// Zod schemas for validation
export const MetaDataSchema = z.object({
  D: z.string(), // Domain
  S: z.array(z.string()).optional(), // Social links
  C: z.string().optional(), // City
  CAT: z.string().optional(), // Category
  ST: z.string().optional(), // State / County
  CO: z.string().optional(), // Country
  Z: z.string().optional(), // Zip code
  CN: z.string().optional(), // Company Name
  T: z.array(z.string()).optional(), // Telephones
  P: z
    .array(
      z.object({
        Name: z.string(), // Name
        Title: z.string(), // Title
      })
    )
    .optional(), // People
  E: z.array(z.string()).optional(), // Emails
});

export const TechDataSchema = z.object({
  D: z.string(), // Domain
  SP: z.number(), // Spend
  SD: z.string().optional(), // Subdomain
  FI: z.string(), // First identified
  LI: z.string(), // Last identified
  T: z.array(
    z.object({
      N: z.string(), // Name of technology
      FD: z.string(), // First detected
      LD: z.string(), // Last detected
    })
  ),
});

export const TechIndexSchema = z.object({
  Name: z.string(),
  Parent: z.string().optional(),
  Premium: z.enum(["Yes", "No", "Maybe"]),
  Description: z.string(),
  Link: z.string(),
  TrendsLink: z.string(),
  Category: z.string(),
  SubCategories: z.array(z.string()).optional(),
  FirstAdded: z.string(),
  Ticker: z.string().optional(),
  Exchange: z.string().optional(),
  PublicCompanyType: z.string().optional(),
});

// Inferred types
export type MetaDataItem = z.infer<typeof MetaDataSchema>;
export type TechDataItem = z.infer<typeof TechDataSchema>;
export type TechIndexItem = z.infer<typeof TechIndexSchema>;
