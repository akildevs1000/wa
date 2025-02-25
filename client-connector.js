const pm2 = require("pm2");

const { clientIds } = require("./clients.json");


pm2.connect((err) => {
    if (err) {
        console.error("PM2 connection error:", err);
        process.exit(1);
    }

    clientIds.forEach(clientId => {
        if (clientId === "AE00027") {
            let payload = {
                script: "client.js",
                name: `child-process-${clientId}`,
                autorestart: true,
                watch: false,
                args: [clientId],
            };

            console.log(payload);

            pm2.start(payload, (err, apps) => {
                if (err) {
                    console.error(`Error starting process for ${clientId}:`, err);
                    return;
                }

                console.log(`Child process started for ${clientId}`);
            });
        }
    });

    // Disconnect from PM2 after starting all processes
    setTimeout(() => {
        pm2.disconnect();
    }, 2000);
});
