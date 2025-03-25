const pm2 = require("pm2");
const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const processesFile = path.join(__dirname, "processes.json");

// Load existing processes
let runningProcesses = {};
if (fs.existsSync(processesFile)) {
    runningProcesses = JSON.parse(fs.readFileSync(processesFile, "utf8"));
}

// Ensure the session directory exists
if (fs.existsSync(sessionBasePath)) {
    const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

    sessionFolders.forEach(folder => {
        pm2Stop(folder);
    });
} else {
    console.log("Session directory does not exist.");
}

function pm2Stop(folder) {
    let clientId = folder.replace("session-", "");
    console.log("🚀 ~ pm2Stop ~ clientId:", clientId)

    // pm2.connect((err) => {
    //     if (err) {
    //         console.error("PM2 connection error:", err);
    //         process.exit(1);
    //     }

    //     if (!runningProcesses[clientId]) {
    //         console.log(`No running process found for ${clientId}. Skipping.`);
    //         return;
    //     }

    //     pm2.stop(clientId, (err) => {
    //         if (err) {
    //             console.error(`Error stopping process for ${clientId}:`, err);
    //             return;
    //         }

    //         console.log(`Stopped process for ${clientId}`);
    //         delete runningProcesses[clientId];

    //         // Save updated processes list
    //         fs.writeFileSync(processesFile, JSON.stringify(runningProcesses, null, 2));
    //     });

    //     setTimeout(() => {
    //         pm2.disconnect();
    //     }, 2000);
    // });
}
