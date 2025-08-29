import { Domain, DomainStats, DomainTechnology, Technology } from "./database";

export interface QueryResult {
  sql: string;
  params: any[];
}

export interface QueryBuilderOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export type TechnologyDetails = Pick<Technology, "name" | "category" | "description"> &
  Pick<DomainTechnology, "spend" | "first_detected" | "last_detected">;

export interface DomainWithTechnologies extends Domain {
  technologies: TechnologyDetails[];
  technologyStats: Pick<DomainStats, "total_technologies" | "total_spend"> & {
    technologyCategories: Record<string, number>;
  };
}
