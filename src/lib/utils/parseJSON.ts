// A JSON parser that attempts to fix common syntax errors like trailing commas before parsing.
function lenientJSONParse(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    const fixedJSON = jsonString.replace(/,\s*([}\]])/g, "$1").trim();
    return JSON.parse(fixedJSON);
  }
}

/**
 * Parses a string that could be either standard JSON or JSONL (newline-delimited JSON).
 * It uses a lenient parser to handle minor syntax errors.
 */
function parseJSON(data: string) {
  try {
    return lenientJSONParse(data);
  } catch (error) {
    try {
      const lines = data.trim().split("\n");
      const parsedLines = lines
        .map((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine === "") return null;

          const match = trimmedLine.match(/{.*}/);
          if (match && match[0]) {
            try {
              return lenientJSONParse(match[0]);
            } catch (e) {
              return null;
            }
          }
          return null;
        })
        .filter((item) => item !== null);

      return parsedLines;
    } catch (jsonlError) {
      throw new Error(
        "Data is not valid JSON or JSONL, even after attempting to fix common errors."
      );
    }
  }
}

export default parseJSON;
