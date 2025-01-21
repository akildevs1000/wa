// Get clientId from command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error("clientId is required");
    process.exit(1);
}

const clientId = args[0]; // First argument: client ID

const sessionFolderPath = path.join(__dirname, `.wwebjs_auth/session-${clientId}`);
if (fs.existsSync(sessionFolderPath)) {
    fs.rmdirSync(sessionFolderPath, { recursive: true });
    console.log(`Session id deleted for client ${clientId}.`);
}