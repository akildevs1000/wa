const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // Time for yesterday

console.log("Checking for old session folders...");

// Ensure the session directory exists
if (fs.existsSync(sessionBasePath)) {
    const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

    sessionFolders.forEach(folder => {
        const folderPath = path.join(sessionBasePath, folder);
        
        try {
            const stats = fs.statSync(folderPath);
            const lastModified = stats.mtime.getTime();

            if (lastModified < oneDayAgo) {
                // fs.rmSync(folderPath, { recursive: true, force: true });
                // console.log(`Deleted old session folder: ${folder}`);
                console.log(`Unused folder: ${folder}`);
            } else {
                console.log(`Keeping session folder: ${folder}`);
            }
        } catch (err) {
            console.error(`Error processing folder ${folder}:`, err);
        }
    });
} else {
    console.log("Session directory does not exist.");
}
