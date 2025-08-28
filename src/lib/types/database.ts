// Database table interfaces
export type Domain = {
  id: number;
  domain: string;
  company_name: string | null;
  category: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  zip_code: string | null;
  social_links: string | null;
  emails: string | null;
  phones: string | null;
  people: string | null;
  created_at: string;
  updated_at: string;
};

export type Technology = {
  id: number;
  name: string;
  category: string | null;
  is_premium: "Yes" | "No" | "Maybe";
  description: string | null;
  parent: string | null;
  link: string | null;
  trends_link: string | null;
  sub_categories: string | null;
  first_added: string | null;
  ticker: string | null;
  exchange: string | null;
  public_company_type: string | null;
  created_at: string;
  updated_at: string;
};

export type DomainTechnology = {
  id: number;
  domain_id: number;
  domain_name: string;
  technology_id: number;
  technology_name: string;
  spend: number | null;
  subdomain: number | null;
  first_identified: string | null;
  last_identified: string | null;
  first_detected: string | null;
  last_detected: string | null;
  created_at: string;
  updated_at: string;
};

export type DomainStats = {
  id: number;
  domain_id: number;
  total_technologies: number;
  technologies_by_category: string | null;
  total_spend: number;
  created_at: string;
  updated_at: string;
};
