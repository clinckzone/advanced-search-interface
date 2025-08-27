import { z } from "zod";
import fs from "fs";
import path from "path";
import { DatabaseSchema } from "./schema";
import parseJSON from "../utils/parseJSON";
import getEncodedString from "../utils/getEncodedString";
import { ensureDomainExists, ensureTechnologyExists } from "./entityCreators";

// Zod schemas for validation
const MetaDataSchema = z.object({
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

const TechDataSchema = z.object({
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

const TechIndexSchema = z.object({
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

type MetaDataItem = z.infer<typeof MetaDataSchema>;
type TechDataItem = z.infer<typeof TechDataSchema>;
type TechIndexItem = z.infer<typeof TechIndexSchema>;

export class DataProcessor {
  private dbSchema: DatabaseSchema;
  private statements: ReturnType<DatabaseSchema["getStatements"]>;

  constructor(dbPath?: string) {
    this.dbSchema = new DatabaseSchema(dbPath);
    this.dbSchema.initializeSchema();
    this.statements = this.dbSchema.getStatements();
  }

  public async processAllData(dataDir: string = "./tmp"): Promise<void> {
    console.log("Starting data processing...");

    try {
      // Process technologies first (they're referenced by company technologies)
      await this.processTechnologies(path.join(dataDir, "techIndex.sample.json"));

      // Process companies
      await this.processDomains(path.join(dataDir, "metaData.sample.json"));

      // Process company-technology relationships
      await this.processDomainTechnologies(path.join(dataDir, "techData.sample.json"));

      // Generate company statistics
      await this.generateDomainStats();

      console.log("Data processing completed successfully!");
    } catch (error) {
      console.error("Error during data processing:", error);
      throw error;
    }
  }

  private async processTechnologies(filePath: string): Promise<void> {
    console.log("Processing technologies...");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Technology index file not found: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const rawData = getEncodedString(buffer);
    const technologies: TechIndexItem[] = parseJSON(rawData);

    let processed = 0;
    const insertMany = this.dbSchema.getDatabase().transaction((techs: TechIndexItem[]) => {
      for (const tech of techs) {
        try {
          const validated = TechIndexSchema.parse(tech);
          this.statements.insertTechnology.run(
            validated.Name,
            validated.Category || null,
            validated.Premium || "No",
            validated.Description || null,
            validated.Parent || null,
            validated.Link || null,
            validated.TrendsLink || null,
            validated.SubCategories ? JSON.stringify(validated.SubCategories) : null,
            validated.FirstAdded ? new Date(validated.FirstAdded).toISOString() : null,
            validated.Ticker || null,
            validated.Exchange || null,
            validated.PublicCompanyType || null
          );
          processed++;
        } catch (error) {
          console.warn("Skipping invalid technology:", error);
        }
      }
    });

    insertMany(technologies);
    console.log(`Processed ${processed} technologies`);
  }

  private async processDomains(filePath: string): Promise<void> {
    console.log("Processing domains...");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Domain metadata file not found: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const rawData = getEncodedString(buffer);
    const domains: MetaDataItem[] = parseJSON(rawData);

    let processed = 0;
    const insertMany = this.dbSchema.getDatabase().transaction((domains: MetaDataItem[]) => {
      for (const domain of domains) {
        try {
          const validated = MetaDataSchema.parse(domain);

          this.statements.insertDomain.run(
            validated.D, // Domain
            validated.CN || null, // Company Name
            validated.CAT || null, // Category
            validated.CO || null, // Country
            validated.ST || null, // State / county
            validated.C || null, // City
            validated.Z || null, // Zip code
            validated.S ? JSON.stringify(validated.S) : null, // Social links
            validated.E ? JSON.stringify(validated.E) : null, // Email
            validated.T ? JSON.stringify(validated.T) : null, // Telephone
            validated.P ? JSON.stringify(validated.P) : null // People
          );
          processed++;
        } catch (error) {
          console.warn("Skipping invalid domain:", error);
        }
      }
    });

    insertMany(domains);
    console.log(`Processed ${processed} domains`);
  }

  private async processDomainTechnologies(filePath: string): Promise<void> {
    console.log("Processing domain-technology relationships...");

    if (!fs.existsSync(filePath)) {
      throw new Error(`Technology data file not found: ${filePath}`);
    }

    const buffer = fs.readFileSync(filePath);
    const rawData = getEncodedString(buffer);
    const techData: TechDataItem[] = parseJSON(rawData);

    let processed = 0;
    const insertMany = this.dbSchema.getDatabase().transaction((data: TechDataItem[]) => {
      for (const item of data) {
        try {
          const validated = TechDataSchema.parse(item);

          // Get domain ID, create if doesn't exist
          const domain = ensureDomainExists(validated.D, this.statements);

          if (validated.T && validated.T.length > 0) {
            for (const tech of validated.T) {
              // Get technology ID, create if doesn't exist
              const technology = ensureTechnologyExists(tech.N, this.statements);

              this.statements.insertDomainTechnology.run(
                domain.id,
                domain.domain,
                technology.id,
                technology.name,
                validated.SP || null, // spend
                validated.SD || null, // subdomain
                validated.FI ? new Date(validated.FI).toISOString() : null, // first_identified
                validated.LI ? new Date(validated.LI).toISOString() : null, // last_identified
                tech.FD ? new Date(tech.FD).toISOString() : null, // first_detected
                tech.LD ? new Date(tech.LD).toISOString() : null // last_detected
              );
            }
          }
          processed++;
        } catch (error) {
          console.warn("Skipping invalid tech data:", error);
        }
      }
    });

    insertMany(techData);
    console.log(`Processed ${processed} domain-technology relationships`);
  }

  private async generateDomainStats(): Promise<void> {
    console.log("Generating domain statistics...");

    const db = this.dbSchema.getDatabase();

    // Get all domains with their technology counts
    const domainsWithStats = db
      .prepare(
        `
      SELECT 
        d.id,
        d.domain,
        COUNT(dt.technology_id) as total_technologies,
        SUM(dt.spend) as total_spend
      FROM domains d
      LEFT JOIN domain_technologies dt ON d.id = dt.domain_id
      GROUP BY d.id
    `
      )
      .all();

    const insertStats = this.dbSchema.getDatabase().transaction((stats: any[]) => {
      for (const domain of stats) {
        // Get technologies by category for this domain
        const techsByCategory = db
          .prepare(
            `
          SELECT t.category, COUNT(*) as count
          FROM domain_technologies dt
          JOIN technologies t ON dt.technology_id = t.id
          WHERE dt.domain_id = ? AND t.category IS NOT NULL
          GROUP BY t.category
        `
          )
          .all(domain.id);

        const categoryCounts: Record<string, number> = {};
        for (const cat of techsByCategory as any[]) {
          categoryCounts[cat.category] = cat.count;
        }

        this.statements.insertDomainStats.run(
          domain.id,
          domain.total_technologies || 0,
          JSON.stringify(categoryCounts),
          domain.total_spend || 0
        );
      }
    });

    insertStats(domainsWithStats);
    console.log(`Generated statistics for ${domainsWithStats.length} domains`);
  }

  public close(): void {
    this.dbSchema.close();
  }

  public getDatabase(): DatabaseSchema {
    return this.dbSchema;
  }
}
