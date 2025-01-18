const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { fetchDescriptions } = require("./description");
require("dotenv").config();

/**
 * Sets Finder comments for a file using AppleScript
 * @param {string} filePath - Full path to the file
 * @param {string} comment - Comment to set
 */
function setFinderComment(filePath, comment) {
  try {
    // Escape quotes and other special characters in the comment
    const escapedComment = comment.replace(/["\\]/g, "\\$&");
    const escapedPath = filePath.replace(/["\\]/g, "\\$&");

    const appleScript = `
      tell application "Finder"
        set theFile to POSIX file "${escapedPath}" as alias
        set comment of theFile to "${escapedComment}"
      end tell
    `;

    execSync(`osascript -e '${appleScript}'`);
    console.log(`Updated Finder comment for: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error setting Finder comment: ${error.message}`);
  }
}

/**
 * Processes video files and organizes them by creator
 * @returns {Promise<void>}
 */
async function processVideos() {
  const directory = path.join(process.env.path_local);
  const folders = fs.readdirSync(directory);

  for (const folder of folders) {
    try {
      const folderPath = path.join(directory, folder);

      // Check if the path is a directory before proceeding
      if (!fs.statSync(folderPath).isDirectory()) {
        console.log(`Skipping non-directory item: ${folder}`);
        continue;
      }

      // First fetch descriptions for all videos in this folder
      await fetchDescriptions(folderPath);

      const files = fs.readdirSync(folderPath);
      // Get all mp4 files in folder
      const mp4Files = files.filter((file) => file.endsWith(".mp4"));

      if (mp4Files.length === 0) {
        console.log(`No MP4 files found in: ${folder}`);
        continue;
      }

      console.log(`Processing ${mp4Files.length} MP4 files in: ${folder}`);

      // For each mp4 file, find its corresponding json file
      for (const mp4File of mp4Files) {
        const mp4FilePath = path.join(folderPath, mp4File);
        const jsonFilePath = path.join(
          folderPath,
          mp4File.replace(".mp4", ".json")
        );

        // Read the description from JSON
        const jsonContent = fs.readFileSync(jsonFilePath, "utf8");
        const json = JSON.parse(jsonContent);
        const url = json.url || json.webpage_url;

        // Parse the url to get the creator name
        const creatorName = url.split("/")[3].split("@")[1];
        console.log(`Processing creator: ${creatorName}`);

        // See if the creator name folder exists in subfolder
        const creatorNameFolderPath = path.join(folderPath, creatorName);
        if (!fs.existsSync(creatorNameFolderPath)) {
          fs.mkdirSync(creatorNameFolderPath);
        }

        // Move the mp4 file into the creator name folder
        const newMp4Path = path.join(creatorNameFolderPath, mp4File);
        fs.renameSync(mp4FilePath, newMp4Path);

        // Update the Finder comments with the description from JSON
        if (json.description) {
          setFinderComment(newMp4Path, json.description);
        }

        // Delete the json file
        fs.unlinkSync(jsonFilePath);
      }
    } catch (error) {
      console.error(`Error processing folder "${folder}":`, error.message);
      continue;
    }
  }
}

// Run the script
processVideos().catch(console.error);
