import { Domain, DomainStats, DomainTechnology, Technology } from "./database";
import { DomainSearch } from "./search";

export interface QueryBuilderOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export type TechnologyDetails = Pick<Technology, "name" | "category" | "description"> &
  Pick<DomainTechnology, "spend" | "first_detected" | "last_detected">;

export type DomainWithTechnologies = {
  technologies: TechnologyDetails[];
  technologyStats: Pick<DomainStats, "total_technologies" | "total_spend"> & {
    technologyCategories: Record<string, number>;
  };
} & Domain;

export type DomainSearchRequest = {
  searchParams: DomainSearch;
  options?: QueryBuilderOptions;
};

export type DomainSearchResult = {
  domains: DomainWithTechnologies[];
  totalCount: number;
};
