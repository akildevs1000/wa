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

const twoHourAgo = Date.now() - 2 * 60 * 60 * 1000; // 2 hour ago

// Ensure the session directory exists
if (fs.existsSync(sessionBasePath)) {
    const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

    sessionFolders.forEach(folder => {


        const folderPath = path.join(sessionBasePath, folder);

        try {
            const stats = fs.statSync(folderPath);
            const lastModified = stats.mtime.getTime();


            if (lastModified > twoHourAgo) {
                pm2Start(folder);
            }
        } catch (err) {
            if (err.code !== "ENOENT") {
                console.log(`❌ Error processing folder ${folder}: ${err.message}`);
            }
        }
    });
} else {
    logMessage("Session directory does not exist.");
}

function pm2Start(folder) {

    let clientId = folder.replace("session-", "");

    pm2.connect((err) => {
        if (err) {
            console.error("PM2 connection error:", err);
            process.exit(1);
        }

        if (runningProcesses[clientId]) {
            console.log(`Process for ${clientId} is already running. Skipping.`);
            return;
        }

        //From terminal => pm2 start client.js --name "clientId"  --cron-restart "0 * * * *" -- clientId

        let payload = {
            script: "client.js",
            name: `${clientId}`,
            autorestart: false,
            watch: false,
            args: [clientId],
            cron_restart: "0 * * * *", // Restart every 1 hours
        };

        console.log("Starting process:", payload);

        pm2.start(payload, (err, apps) => {
            if (err) {
                console.error(`Error starting process for ${clientId}:`, err);
                return;
            }

            console.log(`Child process started for ${clientId}`);
            runningProcesses[clientId] = true;

            // Save updated processes list
            fs.writeFileSync(processesFile, JSON.stringify(runningProcesses, null, 2));
        });

        // Disconnect from PM2 after a delay to allow processes to start
        setTimeout(() => {
            pm2.disconnect();
        }, 2000);
    });
}
