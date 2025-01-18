const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
require("dotenv").config();

/**
 * Fetches video descriptions from TikTok URLs and saves them to JSON files
 * @param {string} folderPath - Path to the folder containing JSON and MP4 files
 * @returns {Promise<void>}
 */
async function fetchDescriptions(folderPath) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const files = fs.readdirSync(folderPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    for (const jsonFile of jsonFiles) {
      try {
        const jsonPath = path.join(folderPath, jsonFile);
        const mp4File = jsonFile.replace(".json", ".mp4");
        const mp4Path = path.join(folderPath, mp4File);

        // Skip if MP4 doesn't exist
        if (!fs.existsSync(mp4Path)) {
          console.log(`MP4 file not found for: ${jsonFile}`);
          continue;
        }

        // Read and parse JSON
        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        const url = jsonContent.url || jsonContent.webpage_url;

        if (!url) {
          console.log(`No URL found in JSON for: ${jsonFile}`);
          continue;
        }

        console.log(`Fetching description for: ${url}`);

        try {
          // Navigate to the URL
          await page.goto(url, { waitUntil: "networkidle" });

          // Wait for and get the description
          const descriptionElement = await page.waitForSelector(
            "xpath=/html/body/div[1]/div[2]/div[2]/div/div[2]/div[1]/div[1]/div[2]/div[2]/div[1]/div/h1",
            { timeout: 10000 }
          );

          const description = await descriptionElement.textContent();

          // Update JSON with description
          jsonContent.description = description;
          fs.writeFileSync(jsonPath, JSON.stringify(jsonContent, null, 2));

          console.log(`Updated description for: ${jsonFile}`);

          // Add a small delay to avoid rate limiting
          await page.waitForTimeout(1000);
        } catch (error) {
          console.error(
            `Error fetching description for ${url}:`,
            error.message
          );
        }
      } catch (error) {
        console.error(`Error processing file "${jsonFile}":`, error.message);
        continue;
      }
    }
  } finally {
    await browser.close();
  }
}

module.exports = { fetchDescriptions };
