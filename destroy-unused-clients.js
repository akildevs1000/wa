const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

console.log("Checking for old session folders...");

// Function to calculate the total size of a directory
function getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(directory) {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                calculateSize(filePath);
            } else {
                totalSize += stats.size;
            }
        });
    }

    if (fs.existsSync(folderPath)) {
        calculateSize(folderPath);
    }

    return totalSize;
}

// Ensure the session directory exists
if (fs.existsSync(sessionBasePath)) {
    const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

    sessionFolders.forEach(folder => {
        const folderPath = path.join(sessionBasePath, folder);

        try {
            if (lastModified < oneDayAgo) {
                
                const stats = fs.statSync(folderPath);
                const lastModified = stats.mtime.getTime();
                const lastModifiedDate = new Date(stats.mtime).toLocaleString(); // Format timestamp
                const folderSizeMB = (getFolderSize(folderPath) / (1024 * 1024)).toFixed(2); // Convert to MB
    
                console.log(`Session: ${folder} | Last Modified: ${lastModifiedDate} | Size: ${folderSizeMB} MB`);

                // fs.rmSync(folderPath, { recursive: true, force: true });
                // console.log(`🗑️ Deleted: ${folder}`);
            } else {
                // console.log(`✅ Kept: ${folder}`);
            }
        } catch (err) {
            console.error(`❌ Error processing folder ${folder}:`, err);
        }
    });
} else {
    console.log("Session directory does not exist.");
}
