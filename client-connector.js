const pm2 = require("pm2");
const fs = require("fs");
const path = require("path");

const { clientIds } = require("./clients.json");

const processesFile = path.join(__dirname, "processes.json");

// Load existing processes
let runningProcesses = {};
if (fs.existsSync(processesFile)) {
    runningProcesses = JSON.parse(fs.readFileSync(processesFile, "utf8"));
}

pm2.connect((err) => {
    if (err) {
        console.error("PM2 connection error:", err);
        process.exit(1);
    }

    clientIds.forEach((clientId) => {
            if (runningProcesses[clientId]) {
                console.log(`Process for ${clientId} is already running. Skipping.`);
                return;
            }

            let payload = {
                script: "client.js",
                name: `child-process-${clientId}`,
                autorestart: true,
                watch: false,
                args: [clientId],
                cron_restart: "*/5 * * * *", // Restart every 2 hours
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
    });

    // Disconnect from PM2 after a delay to allow processes to start
    setTimeout(() => {
        pm2.disconnect();
    }, 2000);
});
