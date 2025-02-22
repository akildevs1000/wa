const pm2 = require("pm2");
const fs = require("fs");
const path = require("path");

const sessionBasePath = path.join(__dirname, ".wwebjs_auth");
const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

// Ensure the session directory exists
if (fs.existsSync(sessionBasePath)) {
    const sessionFolders = fs.readdirSync(sessionBasePath).filter(folder => folder.startsWith("session-"));

    sessionFolders.forEach(folder => {
        const folderPath = path.join(sessionBasePath, folder);

        try {
            const stats = fs.statSync(folderPath);
            const lastModified = stats.mtime.getTime();
            const lastModifiedDate = new Date(stats.mtime).toLocaleString(); // Format timestamp
            const logEntry = `📂 Session: ${folder} | 🕒 Last Modified: ${lastModifiedDate}`;

            if (lastModified > oneDayAgo) {
                console.log("🚀 ~ logEntry:", logEntry)
                console.log(`🗑️ Old: ${folder}`);
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



// return;
// pm2.connect((err) => {
//     if (err) {
//         console.error("PM2 connection error:", err);
//         process.exit(1);
//     }

//     clients.forEach((clientId) => {
//         pm2.start(
//             {
//                 script: "client.js",
//                 name: `child-process-${clientId}`, // Unique name for each process
//                 autorestart: true, // Auto-restart if it crashes
//                 watch: false, // Change to true if you want to restart on file changes
//                 cron_restart: "0 */2 * * *", // Restart every 2 hours
//                 args: [clientId], // Pass client ID to child.js
//             },
//             (err, apps) => {
//                 if (err) {
//                     console.error(`Error starting process for ${clientId}:`, err);
//                     return;
//                 }

//                 console.log(`Child process started for ${clientId}`);
//             }
//         );
//     });

//     // Disconnect from PM2 after starting all processes
//     setTimeout(() => {
//         pm2.disconnect();
//     }, 2000);
// });
