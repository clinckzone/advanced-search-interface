import { Domain, DomainStats, DomainTechnology, Technology } from "./database";

export type TechnologyDetails = Pick<Technology, "name" | "category" | "description"> &
  Pick<DomainTechnology, "spend" | "first_detected" | "last_detected">;

export type DomainWithTechnologies = {
  technologies: TechnologyDetails[];
} & Pick<DomainStats, "total_technologies" | "total_spend"> & {
    technologies_by_category: Record<string, number>;
  } & Domain;

export type DomainSearchResult = {
  domains: DomainWithTechnologies[];
  totalCount: number;
};
