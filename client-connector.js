const pm2 = require("pm2");
const fs = require("fs");

// Read the clients.json file
const clients = JSON.parse(fs.readFileSync("clients.json", "utf8")).clients;

pm2.connect((err) => {
    if (err) {
        console.error("PM2 connection error:", err);
        process.exit(1);
    }

    clients.forEach((clientId) => {
        pm2.start(
            {
                script: "client.js",
                name: `child-process-${clientId}`, // Unique name for each process
                autorestart: true, // Auto-restart if it crashes
                watch: false, // Change to true if you want to restart on file changes
                cron_restart: "0 */2 * * *", // Restart every 2 hours
                args: [clientId], // Pass client ID to child.js
            },
            (err, apps) => {
                if (err) {
                    console.error(`Error starting process for ${clientId}:`, err);
                    return;
                }

                console.log(`Child process started for ${clientId}`);
            }
        );
    });

    // Disconnect from PM2 after starting all processes
    setTimeout(() => {
        pm2.disconnect();
    }, 2000);
});
