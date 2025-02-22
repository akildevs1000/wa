const pm2 = require("pm2");
const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

pm2.connect((err) => {
    if (err) {
        console.error("PM2 connection error:", err);
        process.exit(1);
    }

    // Ensure the session directory exists
    if (fs.existsSync(sessionBasePath)) {
        const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

        sessionFolders.forEach(folder => {
            const folderPath = path.join(sessionBasePath, folder);

            try {
                const stats = fs.statSync(folderPath);
                const lastModified = stats.mtime.getTime();

                if (lastModified > oneDayAgo) {
                    if (folder.split("session-")[1]) {
                        let clientId = folder.split("session-")[1];

                        if (clientId == "test") {
                            let payload = {
                                script: "client.js",
                                name: `child-process-${clientId}`,
                                autorestart: true,
                                max_restarts: 5,  // Limit the number of restarts
                                watch: false,
                                cron_restart: "0 */2 * * *",
                                args: [clientId],
                            };

                            console.log(payload);

                            // pm2.start(payload, (err, apps) => {
                            //     if (err) {
                            //         console.error(`Error starting process for ${clientId}:`, err);
                            //         return;
                            //     }

                            //     console.log(`Child process started for ${clientId}`);
                            // }
                            // );
                        }
                    }

                }
            } catch (err) {
                if (err.code !== "ENOENT") {
                    console.log(`❌ Error processing folder ${folder}: ${err.message}`);
                }
            }
        });
    } else {
        console.log("Session directory does not exist.");
    }



    // Disconnect from PM2 after starting all processes
    setTimeout(() => {
        pm2.disconnect();
    }, 2000);
});
