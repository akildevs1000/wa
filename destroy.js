const fs = require("fs");
const path = require("path");

// Get clientId from command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("clientId is required");
    process.exit(1);
}

const clientId = args[0]; // First argument: client ID

const sessionFolderPath = path.join(__dirname, `.wwebjs_auth/session-${clientId}`);

console.log(`Attempting to delete session folder at: ${sessionFolderPath}`);

// Check if the folder exists
if (fs.existsSync(sessionFolderPath)) {
    try {
        // Use fs.rmSync() for deleting a non-empty directory
        fs.rmSync(sessionFolderPath, { recursive: true, force: true });
        console.log(`Session folder deleted for client ${clientId}.`);
    } catch (err) {
        console.error("Error deleting session folder:", err);
    }
} else {
    console.log(`Session folder for client ${clientId} not found.`);
}
