import type {
  DomainSearch,
  StringFilter,
  LogicalFilter,
  RangeFilter,
  TechnologyCategoryFilter,
} from "../types/search";

export interface QueryResult {
  sql: string;
  params: any[];
}

export interface QueryBuilderOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export class QueryBuilder {
  private searchParams: DomainSearch;
  private whereConditions: string[] = [];
  private joins: string[] = [];
  private params: any[] = [];
  private needsTechnologyJoin = false;
  private needsDomainTechJoin = false;
  private needsStatsJoin = false;

  constructor(searchParams: DomainSearch) {
    this.searchParams = searchParams;
  }

  public buildQuery(options: QueryBuilderOptions = {}): QueryResult {
    this.reset();
    this.analyzeRequiredJoins();
    this.buildJoins();
    this.buildWhereConditions();

    const selectClause = "SELECT DISTINCT d.*";
    const fromClause = "FROM domains d";
    const joinClause = this.joins.length > 0 ? this.joins.join(" ") : "";
    const whereClause =
      this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";

    let orderByClause = "";
    if (options.sortBy) {
      const order = options.sortOrder || "ASC";
      orderByClause = `ORDER BY ${this.sanitizeSortField(options.sortBy)} ${order}`;
    }

    let limitClause = "";
    if (options.limit !== undefined) {
      limitClause = `LIMIT ${options.limit}`;
      if (options.offset !== undefined) {
        limitClause += ` OFFSET ${options.offset}`;
      }
    }

    const sql = [selectClause, fromClause, joinClause, whereClause, orderByClause, limitClause]
      .filter((clause) => clause.length > 0)
      .join(" ");

    return { sql, params: this.params };
  }

  public buildCountQuery(): QueryResult {
    this.reset();
    this.analyzeRequiredJoins();
    this.buildJoins();
    this.buildWhereConditions();

    const selectClause = "SELECT COUNT(DISTINCT d.id) as total";
    const fromClause = "FROM domains d";
    const joinClause = this.joins.length > 0 ? this.joins.join(" ") : "";
    const whereClause =
      this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(" AND ")}` : "";

    const sql = [selectClause, fromClause, joinClause, whereClause]
      .filter((clause) => clause.length > 0)
      .join(" ");

    return { sql, params: this.params };
  }

  private reset(): void {
    this.whereConditions = [];
    this.joins = [];
    this.params = [];
    this.needsTechnologyJoin = false;
    this.needsDomainTechJoin = false;
    this.needsStatsJoin = false;
  }

  private analyzeRequiredJoins(): void {
    // Check if we need technology-related joins
    if (
      this.searchParams.technologies ||
      this.searchParams.technologyCategories ||
      this.searchParams.totalSpendRange
    ) {
      this.needsDomainTechJoin = true;
    }

    if (this.searchParams.technologyCategories) {
      this.needsTechnologyJoin = true;
    }

    if (this.searchParams.technologyCountRange) {
      this.needsStatsJoin = true;
    }
  }

  private buildJoins(): void {
    if (this.needsDomainTechJoin) {
      this.joins.push("LEFT JOIN domain_technologies dt ON d.id = dt.domain_id");
    }

    if (this.needsTechnologyJoin) {
      this.joins.push("LEFT JOIN technologies t ON dt.technology_id = t.id");
    }

    if (this.needsStatsJoin) {
      this.joins.push("LEFT JOIN domain_stats ds ON d.id = ds.domain_id");
    }
  }

  private buildWhereConditions(): void {
    // Domain filter
    if (this.searchParams.domain) {
      this.addStringFilter("d.domain", this.searchParams.domain);
    }

    // Company name filter
    if (this.searchParams.companyName) {
      this.addStringFilter("d.company_name", this.searchParams.companyName);
    }

    // Category filter (single-value field)
    if (this.searchParams.category) {
      this.addLogicalFilter("d.category", this.searchParams.category);
    }

    // Country filter (single-value field)
    if (this.searchParams.country) {
      this.addLogicalFilter("d.country", this.searchParams.country);
    }

    // Technologies filter (multi-value field)
    if (this.searchParams.technologies) {
      const techFilter = { ...this.searchParams.technologies, isMultiValue: true };
      this.addLogicalFilter("dt.technology_name", techFilter);
    }

    // Technology categories filter
    if (this.searchParams.technologyCategories) {
      this.addTechnologyCategoriesFilter(this.searchParams.technologyCategories);
    }

    // Total spend range filter
    if (this.searchParams.totalSpendRange) {
      this.addRangeFilter("dt.spend", this.searchParams.totalSpendRange);
    }

    // Technology count range filter
    if (this.searchParams.technologyCountRange) {
      this.addRangeFilter("ds.total_technologies", this.searchParams.technologyCountRange);
    }
  }

  private addStringFilter(column: string, filter: StringFilter): void {
    const paramPlaceholder = this.getNextParam();

    let condition = "";
    let value = filter.value;

    if (!filter.caseSensitive) {
      column = `LOWER(${column})`;
      value = value.toLowerCase();
    }

    switch (filter.matchType) {
      case "exact":
        condition = `${column} = ${paramPlaceholder}`;
        break;
      case "startsWith":
        condition = `${column} LIKE ${paramPlaceholder}`;
        value = `${value}%`;
        break;
      case "endsWith":
        condition = `${column} LIKE ${paramPlaceholder}`;
        value = `%${value}`;
        break;
      case "contains":
      default:
        condition = `${column} LIKE ${paramPlaceholder}`;
        value = `%${value}%`;
        break;
    }

    this.whereConditions.push(condition);
    this.params.push(value);
  }

  private addLogicalFilter(column: string, filter: LogicalFilter<string>): void {
    const conditions: string[] = [];

    // Single-value fields: include and exclude are mutually exclusive
    // Meant for - "category", "country" fields
    if (!filter.isMultiValue) {
      if (filter.include && filter.include.length > 0) {
        const includeConditions = filter.include.map(() => `${column} = ${this.getNextParam()}`);
        conditions.push(`(${includeConditions.join(" OR ")})`);
        this.params.push(...filter.include);
      } else if (filter.exclude && filter.exclude.length > 0) {
        const excludeConditions = filter.exclude.map(() => `${column} != ${this.getNextParam()}`);
        conditions.push(`(${excludeConditions.join(" AND ")})`);
        this.params.push(...filter.exclude);
      }
      // No requireAll for single-value fields as it's logically not possible
    }

    // Multi-value fields: handle complex many-to-many relationships
    // Meant for - "technologies" field
    else {
      // Include (OR operation)
      if (filter.include && filter.include.length > 0) {
        const placeholders = filter.include.map(() => this.getNextParam()).join(", ");
        conditions.push(`${column} IN (${placeholders})`);
        this.params.push(...filter.include);
      }

      // Exclude (NOT operation) - use subquery for many-to-many
      if (filter.exclude && filter.exclude.length > 0) {
        const subquery = `d.id NOT IN (
          SELECT DISTINCT dt2.domain_id 
          FROM domain_technologies dt2 
          WHERE ${column} IN (${filter.exclude.map(() => this.getNextParam()).join(", ")})
        )`;
        conditions.push(subquery);
        this.params.push(...filter.exclude);
      }

      // Require All (AND operation) - use subquery with HAVING COUNT
      if (filter.requireAll && filter.requireAll.length > 0) {
        const subquery = `d.id IN (
          SELECT dt3.domain_id
          FROM domain_technologies dt3
          WHERE ${column} IN (${filter.requireAll.map(() => this.getNextParam()).join(", ")})
          GROUP BY dt3.domain_id
          HAVING COUNT(DISTINCT ${column}) = ${filter.requireAll.length}
        )`;
        conditions.push(subquery);
        this.params.push(...filter.requireAll);
      }
    }

    if (conditions.length > 0) {
      this.whereConditions.push(conditions.join(" AND "));
    }
  }

  private addTechnologyCategoriesFilter(filters: TechnologyCategoryFilter[]): void {
    const categoryConditions: string[] = [];

    for (const filter of filters) {
      const conditions: string[] = [];

      // Basic category filter
      conditions.push(`t.category = ${this.getNextParam()}`);
      this.params.push(filter.category);

      // Count constraints
      if (filter.minCount !== undefined || filter.maxCount !== undefined) {
        let countCondition = `d.id IN (
          SELECT dt4.domain_id
          FROM domain_technologies dt4
          JOIN technologies t4 ON dt4.technology_id = t4.id
          WHERE t4.category = ${this.getNextParam()}
          GROUP BY dt4.domain_id
          HAVING COUNT(*) `;

        this.params.push(filter.category);

        if (filter.minCount !== undefined && filter.maxCount !== undefined) {
          countCondition += `BETWEEN ${this.getNextParam()} AND ${this.getNextParam()}`;
          this.params.push(filter.minCount, filter.maxCount);
        } else if (filter.minCount !== undefined) {
          countCondition += `>= ${this.getNextParam()}`;
          this.params.push(filter.minCount);
        } else if (filter.maxCount !== undefined) {
          countCondition += `<= ${this.getNextParam()}`;
          this.params.push(filter.maxCount);
        }

        countCondition += ")";
        conditions.push(countCondition);
      }

      const combinedCondition = conditions.join(" AND ");

      if (filter.operator === "NOT") {
        categoryConditions.push(`NOT (${combinedCondition})`);
      } else {
        categoryConditions.push(`(${combinedCondition})`);
      }
    }

    if (categoryConditions.length > 0) {
      // NOTE: If you use OR anywhere, you want an inclusive
      // search otherwise, you want a restrictive search
      const operator = filters.some((f) => f.operator === "OR") ? " OR " : " AND ";
      this.whereConditions.push(`(${categoryConditions.join(operator)})`);
    }
  }

  private addRangeFilter(column: string, filter: RangeFilter<number>): void {
    const conditions: string[] = [];

    if (filter.min !== undefined) {
      const operator = filter.inclusive ? ">=" : ">";
      conditions.push(`${column} ${operator} ${this.getNextParam()}`);
      this.params.push(filter.min);
    }

    if (filter.max !== undefined) {
      const operator = filter.inclusive ? "<=" : "<";
      conditions.push(`${column} ${operator} ${this.getNextParam()}`);
      this.params.push(filter.max);
    }

    if (conditions.length > 0) {
      this.whereConditions.push(conditions.join(" AND "));
    }
  }

  private getNextParam(): string {
    return `?`;
  }

  private sanitizeSortField(field: string): string {
    // Whitelist allowed sort fields to prevent SQL injection
    const allowedFields = [
      "d.domain",
      "d.company_name",
      "d.category",
      "d.country",
      "d.created_at",
      "d.updated_at",
      "ds.total_technologies",
      "ds.total_spend",
    ];

    if (allowedFields.includes(field)) {
      return field;
    }

    // Default to domain if field is not allowed
    return "d.domain";
  }
}
