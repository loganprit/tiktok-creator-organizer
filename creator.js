const fs = require("fs");
const path = require("path");
require("dotenv").config();

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
      console.log(jsonFilePath);

      // In the json file, find the "url" field
      const jsonContent = fs.readFileSync(jsonFilePath, "utf8");
      const json = JSON.parse(jsonContent);
      const url = json.url || json.webpage_url;
      console.log(url);

      // Parse the url to get the creator name
      const creatorName = url.split("/")[3].split("@")[1];
      console.log(creatorName);

      // See if the creator name folder exists in subfolder
      const creatorNameFolderPath = path.join(folderPath, creatorName);
      if (!fs.existsSync(creatorNameFolderPath)) {
        fs.mkdirSync(creatorNameFolderPath);
      }

      // Move the mp4 file into the creator name folder
      fs.renameSync(mp4FilePath, path.join(creatorNameFolderPath, mp4File));

      // Delete the json file
      fs.unlinkSync(jsonFilePath);
    }
  } catch (error) {
    console.error(`Error processing folder "${folder}":`, error.message);
    continue;
  }
}
