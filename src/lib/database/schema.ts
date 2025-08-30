import path from "path";
import Database from "better-sqlite3";

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
    // Create domains table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS domains (
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

    // Create domain_technologies table (many-to-many relationship)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS domain_technologies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain_id INTEGER NOT NULL,
        domain_name TEXT NOT NULL,
        technology_id INTEGER NOT NULL,
        technology_name TEXT NOT NULL,
        spend INTEGER,
        subdomain INTEGER,
        first_identified DATETIME,
        last_identified DATETIME,
        first_detected DATETIME,
        last_detected DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (domain_id) REFERENCES domains (id) ON DELETE CASCADE,
        FOREIGN KEY (technology_id) REFERENCES technologies (id) ON DELETE CASCADE,
        UNIQUE(domain_id, technology_id)
      )
    `);

    // Create domain_stats table for performance
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS domain_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain_id INTEGER UNIQUE NOT NULL,
        total_technologies INTEGER DEFAULT 0,
        technologies_by_category TEXT,
        total_spend INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (domain_id) REFERENCES domains (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for dropdown filter performance
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_domains_country ON domains(country)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_domains_category ON domains(category)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category)`);
    this.db.exec(
      `CREATE INDEX IF NOT EXISTS idx_domain_technologies_technology_id ON domain_technologies(technology_id)`
    );
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
      insertDomain: this.db.prepare(`
        INSERT OR REPLACE INTO domains 
        (domain, company_name, category, country, state, city, zip_code, social_links, emails, phones, people, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertTechnology: this.db.prepare(`
        INSERT OR REPLACE INTO technologies 
        (name, category, is_premium, description, parent, link, trends_link, sub_categories, first_added, ticker, exchange, public_company_type, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertDomainTechnology: this.db.prepare(`
        INSERT OR REPLACE INTO domain_technologies 
        (domain_id, domain_name, technology_id, technology_name, spend, subdomain, first_identified, last_identified, first_detected, last_detected, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      insertDomainStats: this.db.prepare(`
        INSERT OR REPLACE INTO domain_stats 
        (domain_id, total_technologies, technologies_by_category, total_spend, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `),

      getDomainByName: this.db.prepare("SELECT * FROM domains WHERE domain = ?"),
      getTechnologyByName: this.db.prepare("SELECT * FROM technologies WHERE name = ?"),
      getDomainTechnologies: this.db.prepare(`
        SELECT t.name, t.category, dt.spend, dt.first_detected, dt.last_detected
        FROM domain_technologies dt
        JOIN technologies t ON dt.technology_id = t.id
        WHERE dt.domain_id = ?
      `),
    };
  }
}
