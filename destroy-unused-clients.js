const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const logFilePath = path.join(__dirname, "logs/destroy-unused-clients.log");
const oneMonthAgo = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago


console.log("Checking for old session folders...");
logMessage("Checking for old session folders...");

// Function to log messages to a file
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.log(message);
}

// Function to calculate the total size of a directory safely
function getFolderSize(folderPath) {
    let totalSize = 0;

    function calculateSize(directory) {
        try {
            const files = fs.readdirSync(directory);

            files.forEach(file => {
                const filePath = path.join(directory, file);

                try {
                    const stats = fs.statSync(filePath);

                    if (stats.isDirectory()) {
                        calculateSize(filePath);
                    } else {
                        totalSize += stats.size;
                    }
                } catch (err) {
                    if (err.code !== "ENOENT") {
                        logMessage(`⚠️ Error accessing file: ${filePath} - ${err.message}`);
                    }
                }
            });
        } catch (err) {
            if (err.code !== "ENOENT") {
                logMessage(`⚠️ Error reading directory: ${directory} - ${err.message}`);
            }
        }
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
            const stats = fs.statSync(folderPath);
            const lastModified = stats.mtime.getTime();
            const lastModifiedDate = new Date(stats.mtime).toLocaleString(); // Format timestamp
            const folderSizeMB = (getFolderSize(folderPath) / (1024 * 1024)).toFixed(2); // Convert to MB

            const logEntry = `📂 Session: ${folder} | 🕒 Last Modified: ${lastModifiedDate} | 📦 Size: ${folderSizeMB} MB`;
            logMessage(logEntry);

            if (lastModified < oneMonthAgo) {
                fs.rmSync(folderPath, { recursive: true, force: true });
                logMessage(`🗑️ Deleted: ${folder}`);
            } else {
                logMessage(`✅ Kept: ${folder}`);
            }
        } catch (err) {
            if (err.code !== "ENOENT") {
                logMessage(`❌ Error processing folder ${folder}: ${err.message}`);
            }
        }
    });
} else {
    logMessage("Session directory does not exist.");
}
