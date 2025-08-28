import { Domain, Technology } from "../types";
import { DatabaseSchema } from "./schema";

/**
 * Creates a domain entry if it doesn't
 * exist and returns the domain record
 */
export function ensureDomainExists(
  domainName: string,
  statements: ReturnType<DatabaseSchema["getStatements"]>
): Domain {
  let domain = statements.getDomainByName.get(domainName) as Domain;
  if (!domain) {
    // Create new domain entry with minimal required data
    statements.insertDomain.run(
      domainName, // domain name
      null, // company_name
      null, // category
      null, // country
      null, // state
      null, // city
      null, // zip_code
      null, // social_links
      null, // emails
      null, // phones
      null // people
    );

    // Retrieve the newly created domain
    domain = statements.getDomainByName.get(domainName) as Domain;
    console.log(`Created new domain entry for: ${domainName}`);
  }
  return domain;
}

/**
 * Creates a technology entry if it doesn't exist
 * and returns the technology record.
 */
export function ensureTechnologyExists(
  technologyName: string,
  statements: ReturnType<DatabaseSchema["getStatements"]>
): Technology {
  let technology = statements.getTechnologyByName.get(technologyName) as Technology;
  if (!technology) {
    // Create new technology entry with minimal required data
    statements.insertTechnology.run(
      technologyName, // name (the only data we have)
      null, // category
      "No", // is_premium (default)
      null, // description
      null, // parent
      null, // link
      null, // trends_link
      null, // sub_categories
      null, // first_added
      null, // ticker
      null, // exchange
      null // public_company_type
    );

    // Retrieve the newly created technology
    technology = statements.getTechnologyByName.get(technologyName) as Technology;
    console.log(`Created new technology entry for: ${technologyName}`);
  }
  return technology;
}
