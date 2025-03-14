const pm2 = require("pm2");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const processesFile = path.join(__dirname, "processes.json");
const apiUrl = "https://backend.mytime2cloud.com/api/whatsapp-all-clients";

// Load existing processes
let runningProcesses = {};
if (fs.existsSync(processesFile)) {
    runningProcesses = JSON.parse(fs.readFileSync(processesFile, "utf8"));
}

// Fetch client IDs from API
axios.get(apiUrl)
    .then(response => {
        const clientIds = response.data;

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
                    autorestart: false,
                    watch: false,
                    args: [clientId],
                    cron_restart: "0 */2 * * *", // Restart every 2 hours
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
    })
    .catch(error => {
        console.error("Error fetching client IDs from API:", error);
    });
