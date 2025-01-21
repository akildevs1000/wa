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

try {
    // Use fs.rmSync() for deleting a non-empty directory
    if (fs.existsSync(sessionFolderPath)) {
        fs.rmSync(sessionFolderPath, { recursive: true, force: true });
        console.log(`Session folder deleted for client ${clientId}.`);
    } else {
        console.log(`Session folder for client ${clientId} not found.`);
    }
} catch (err) {
    console.error("Error deleting session folder:", err);
}
