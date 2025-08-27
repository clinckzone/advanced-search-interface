import path from "path";
import Database from "better-sqlite3";

export interface Company {
  id?: number;
  domain: string;
  companyName: string | null;
  category: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zipCode: string | null;
  socialLinks: string | null; // JSON string
  emails: string | null; // JSON string
  phones: string | null; // JSON string
  people: string | null; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

export interface Technology {
  id?: number;
  name: string;
  category: string | null;
  isPremium: "Yes" | "No" | "Maybe" | null;
  description: string | null;
  parent: string | null;
  link: string | null;
  trendsLink: string | null;
  subCategories: string | null; // JSON string
  firstAdded: Date | null;
  ticker: string | null;
  exchange: string | null;
  publicCompanyType: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyTechnology {
  id?: number;
  companyId: number;
  technologyId: number;
  spend: number | null;
  subdomain: number | null;
  firstIdentified: Date | null;
  lastIdentified: Date | null;
  firstDetected: Date | null;
  lastDetected: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyStats {
  id?: number;
  companyId: number;
  totalTechnologies: number;
  technologiesByCategory: string; // JSON string
  totalSpend: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseSchema {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const dbFile = dbPath || path.join(process.cwd(), "data", "builtwith.db");
    this.db = new Database(dbFile);
    this.db.pragma("journal_mode = WAL"); // Write-Ahead Logging
    this.db.pragma("synchronous = NORMAL");
    this.db.pragma("cache_size = 1000000");
  }

  public initializeSchema(): void {
    // Create companies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT UNIQUE NOT NULL,
        company_name TEXT,
        category TEXT,
        country TEXT,
        state TEXT,
        city TEXT,
        zip_code TEXT,
        social_links TEXT,
        emails TEXT,
        phones TEXT,
        people TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create technologies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS technologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT,
        is_premium TEXT DEFAULT 'No' CHECK(is_premium IN ('Yes', 'No', 'Maybe')),
        description TEXT,
        parent TEXT,
        link TEXT,
        trends_link TEXT,
        sub_categories TEXT,
        first_added DATETIME,
        ticker TEXT,
        exchange TEXT,
        public_company_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company_technologies table (many-to-many relationship)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS company_technologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        technology_id INTEGER NOT NULL,
        spend INTEGER,
        subdomain INTEGER,
        first_identified DATETIME,
        last_identified DATETIME,
        first_detected DATETIME,
        last_detected DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE,
        UNIQUE(company_id, technology_id)
      )
    `);

    // Create company_stats table for performance
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS company_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER UNIQUE NOT NULL,
        total_technologies INTEGER DEFAULT 0,
        technologies_by_category TEXT,
        total_spend INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
      )
    `);
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }

  // Prepared statements for common operations
  public getStatements() {
    return {
      insertCompany: this.db.prepare(`
        INSERT OR REPLACE INTO companies 
        (domain, company_name, category, country, state, city, zip_code, social_links, emails, phones, people, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertTechnology: this.db.prepare(`
        INSERT OR REPLACE INTO technologies 
        (name, category, is_premium, description, parent, link, trends_link, sub_categories, first_added, ticker, exchange, public_company_type, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertCompanyTechnology: this.db.prepare(`
        INSERT OR REPLACE INTO company_technologies 
        (company_id, technology_id, spend, subdomain, first_identified, last_identified, first_detected, last_detected, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertCompanyStats: this.db.prepare(`
        INSERT OR REPLACE INTO company_stats 
        (company_id, total_technologies, technologies_by_category, total_spend, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      getCompanyByDomain: this.db.prepare("SELECT * FROM companies WHERE domain = ?"),
      getTechnologyByName: this.db.prepare("SELECT * FROM technologies WHERE name = ?"),
      getCompanyTechnologies: this.db.prepare(`
        SELECT t.name, t.category, ct.spend, ct.first_detected, ct.last_detected
        FROM company_technologies ct
        JOIN technologies t ON ct.technology_id = t.id
        WHERE ct.company_id = ?
      `),
    };
  }
}
