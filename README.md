# TikTok Creator Organizer

## Description

A Node.js script (Yes I know) that organizes downloaded TikTok videos by creator name using JSON metadata. Originally created to organize TikTok content exported via Downie before the TikTok ban, this tool helps users sort their video collections by creator, making it easier to find and follow content creators on other platforms. This specific branch allows for the use of `description.js` to fetch and update video descriptions on macOS.

## Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (usually comes with Node.js)
- Downie (what I used) or yt-dlp (cross-platform)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/loganprit/tiktok-creator-organizer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd tiktok-creator-organizer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Get TikTok video links:

   - Use [TikTok to yt-dlp](https://github.com/dinoosauro/tiktok-to-ytdlp) to generate text files containing video links for each creator/collection.

2. Download videos:

   - **Using Downie (macOS)**:

     1. Open Downie Settings > Destination
     2. Enable "Save Metadata to JSON file"
     3. Drag and drop the text files into Downie

   - **Using yt-dlp**:
     ```bash
     yt-dlp --write-info-json --no-clean-info-json -a <text-file>.txt
     ```

3. Configure environment:
   Create a `.env` file in the project root:

   ```plaintext
   path_local="/path/to/your/downloads/folder"
   ```

   Note: Each collection should be in a subfolder of this path.

4. Run the script:
   ```bash
   npm start
   ```

## How It Works

1. The script scans the specified directory for video collections.
2. For each MP4 file found:
   - Locates the corresponding JSON metadata file.
   - Uses `description.js` to fetch and update the video description.
   - Extracts the creator name from the metadata.
   - Creates a creator-specific folder.
   - Moves the video to the appropriate folder.
   - Cleans up the JSON metadata file.

## Error Handling

The script includes robust error handling for:

- Invalid directory paths
- Missing JSON metadata files
- File system operations
- Non-directory items in the scan path

## Contributing

This is a personal project and I don't plan on adding any features to it.

## Limitations

- Only supports MP4 files
- Requires JSON metadata for each video
- Collections must be in separate subfolders of the path you set in the `.env` file

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [dinoosauro](https://github.com/dinoosauro) for their [TikTok to yt-dlp](https://github.com/dinoosauro/tiktok-to-ytdlp) tool
- Downie and yt-dlp for their video downloading capabilities
