const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");

const server = http.createServer();
const wss = new WebSocketServer({ server });

const app = express();

app.use(express.json());
app.use(cors());

let clients = {}; // Store clients by client id

wss.on("connection", (ws) => {
    ws.on("message", async (message) => {
        const data = JSON.parse(message);
        if (data.type === "clientId") {
            await init(ws, data.clientId);
        }
    });

    ws.on("close", () => {
        for (const clientId in clients) {
            if (clients[clientId].ws === ws) {
                console.log(`Client with ID ${clientId} disconnected.`);
                // Handle client cleanup
                delete clients[clientId];
                break;
            }
        }
    });
});

server.listen(5175, () => {
    console.log("WebSocket server running on ws://localhost:5175");
});

async function init(ws, clientId) {
    ws.send(
        JSON.stringify({
            type: "status",
            ready: true,
            message: `Connecting to whatsapp...`,
            source: "socket",
        })
    );
    try {
        const clientProcess = spawn("node", ["app.js", clientId], {
            stdio: ["inherit", "inherit", "inherit", "ipc"], // Enable IPC for communication
        });

        // Listen for messages from the child process
        clientProcess.on("message", (message) => {
            if (message.type === "qr") {
                ws.send(JSON.stringify({ type: "qr", qr: message.qr }));
            } else if (message.type === "status") {
                ws.send(
                    JSON.stringify({
                        type: "status",
                        ready: true,
                        message: message.message,
                    })
                );
            }
        });

        clientProcess.on("exit", (code) => {
            ws.send(
                JSON.stringify({
                    type: "status",
                    ready: true,
                    message: `Connecting to whatsapp...`,
                    source: "socket",
                })
            );
            console.log(`🚀 ~ clientProcess.on ~ process exited with code ${code}:`)
        });

        // // Handle process exit
        clientProcess.on("close", (code) => {
            console.log(`🚀 ~ clientProcess.on ~ process closed with code ${code}:`)
            ws.send(
                JSON.stringify({
                    type: "status",
                    ready: true,
                    message: `Connecting to whatsapp...`,
                    source: "socket",
                })
            );
        });

        // Store the process and WebSocket for later use
        clients[clientId] = { clientProcess, ws, isClientReady: false };
    } catch (error) {
        ws.send(
            JSON.stringify({
                type: "error",
                message: `Error: ${error.message}`,
            })
        );
    }
}

// API to send a message for a specific client
app.post("/api/send-message", async (req, res) => {
    const { clientId, phone, message } = req.body;

    if (!clients[clientId] || !clients[clientId].isClientReady) {
        return res
            .status(400)
            .json({ success: false, message: "WhatsApp client is expired." });
    }

    try {
        const formattedPhone = `${phone}@c.us`; // Format phone number
        // Send message using the spawned process (you could communicate with the client process here)
        clients[clientId].clientProcess.stdin.write(
            JSON.stringify({ phone: formattedPhone, message }) + "\n"
        );
        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send message.",
            error: error.message,
        });
    }
});

// Serve client.html
app.get("/server", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start the server
const port = 5176;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
