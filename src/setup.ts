/*
 * Download data from source as a zip File
 * Unzip the file into a tmp folder
 */

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { DataProcessor } from "./lib/database/dataProcessor.js";

const SOURCE_URL = "https://fiber-challenges.s3.us-east-1.amazonaws.com/sample-data.zip";
const TMP_DIR = "tmp";
const ZIP_FILE_NAME = "sample-data.zip";

async function downloadFile(url: string, outputPath: string): Promise<void> {
  console.log(`📥 Downloading from: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    fs.writeFileSync(outputPath, data);
    console.log(`✅ Downloaded successfully to: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    throw error;
  }
}

function extractZip(zipPath: string, extractToDir: string): void {
  console.log(`📦 Extracting zip file to: ${extractToDir}`);

  try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractToDir, true);
    console.log(`✅ Extraction completed successfully`);
  } catch (error) {
    console.error("❌ Error extracting zip file:", error);
    throw error;
  }
}

async function setup(): Promise<void> {
  try {
    console.log("🚀 Starting setup process...");

    // Create tmp directory if it doesn't exist
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
      console.log(`📁 Created directory: ${TMP_DIR}`);
    } else {
      console.log(`📁 Directory already exists: ${TMP_DIR}`);
    }

    const zipPath = path.join(TMP_DIR, ZIP_FILE_NAME);

    // Download the zip file
    await downloadFile(SOURCE_URL, zipPath);

    // Extract the zip file
    extractZip(zipPath, TMP_DIR);

    // Clean up - remove the zip file after extraction
    fs.unlinkSync(zipPath);
    console.log(`🗑️  Cleaned up zip file: ${ZIP_FILE_NAME}`);

    // Process the data into the database
    console.log("\n💾 Processing data into database...");
    await processData();

    console.log("🎉 Setup completed successfully!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

async function processData(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log("📁 Created data directory");
    }

    // Check if required files exist
    const requiredFiles = ["metaData.sample.json", "techIndex.sample.json", "techData.sample.json"];
    const tmpDir = path.join(process.cwd(), TMP_DIR);

    for (const file of requiredFiles) {
      const filePath = path.join(tmpDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file not found: ${filePath}`);
      }
    }

    const processor = new DataProcessor();

    console.log("⚙️  Starting data processing...");
    const startTime = Date.now();

    await processor.processAllData(tmpDir);

    const endTime = Date.now();
    console.log(`⏱️  Data processing completed in ${endTime - startTime}ms`);

    // Get some basic stats
    const db = processor.getDatabase().getDatabase();
    const companyCount = db.prepare("SELECT COUNT(*) as count FROM companies").get() as any;
    const techCount = db.prepare("SELECT COUNT(*) as count FROM technologies").get() as any;
    const relationshipCount = db
      .prepare("SELECT COUNT(*) as count FROM company_technologies")
      .get() as any;

    console.log("\n📊 Database Statistics:");
    console.log(`   - Companies: ${companyCount.count}`);
    console.log(`   - Technologies: ${techCount.count}`);
    console.log(`   - Company-Technology Relationships: ${relationshipCount.count}`);

    processor.close();
  } catch (error) {
    console.error("❌ Data processing failed:", error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup();
}
