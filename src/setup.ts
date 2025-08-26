/*
 * Download data from source as a zip File
 * Unzip the file into a tmp folder
 */

import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

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

    console.log("🎉 Setup completed successfully!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setup();
}
