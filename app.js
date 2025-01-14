const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const http = require("http");
const { WebSocketServer } = require("ws");
const { Client, LocalAuth } = require("whatsapp-web.js");

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
        console.log(
          `Client with ID ${clientId} disconnected. bescause of web socket is closed`
        );
        // delete clients[clientId];
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

    const sessionDir = path.join(".wwebjs_auth", `session-${clientId}`);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log(`Cleaned up session directory for client ${clientId}`);
    }

    const whatsappClient = new Client({
      authStrategy: new LocalAuth({ clientId }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/snap/bin/chromium", // Replace with your Chromium path
      },
    });

    // Add event listeners
    whatsappClient.on("qr", (qr) => {
      ws.send(JSON.stringify({ type: "qr", qr }));
    });

    whatsappClient.on("ready", () => {
      clients[clientId].isClientReady = true;
      ws.send(
        JSON.stringify({
          type: "status",
          ready: true,
          message: `Client is ready.`,
          source: "whatsapp",
        })
      );
    });

    whatsappClient.on("auth_failure", (message) => {
      ws.send(
        JSON.stringify({
          type: "error",
          message: `Authentication failed: ${message}`,
        })
      );
    });

    whatsappClient.on("disconnected", (reason) => {
      console.log(`Whatsapp Client ${clientId} disconnected: ${reason}`);
      ws.send(
        JSON.stringify({ type: "error", message: `Disconnected: ${reason}` })
      );
      delete clients[clientId];

      const sessionDir = path.join(".wwebjs_auth", `session-${clientId}`);
      if (fs.existsSync(sessionDir)) {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`Cleaned up session directory for client ${clientId}`);
      }
    });

    // Save the client
    clients[clientId] = { whatsappClient, ws, isClientReady: false };
    // console.log("🚀 ~ whatsappClient.on ~ clients[clientId]:", clients[clientId])
    await whatsappClient.initialize();
  } catch (error) {

    // Restart the PM2 process and reinitialize
    // const pm2ProcessId = 13; // Replace with your PM2 process ID

    // const { exec } = require("child_process");

    ws.send(
      JSON.stringify({
        type: "status",
        ready: true,
        message: `Trying to connect in 10 secs`,
        source: "socket",
      })
    );

    setTimeout(() => {
      exec(`pm2 reload ${pm2ProcessId}`, (err, stdout, stderr) => {
        console.log(`Trying to connect in 10 secs`);

        init(ws, clientId).catch((initError) => {
          ws.send(
            JSON.stringify({
              type: "error",
              message: `Failed to connect try again after 10 sec`,
            })
          );
        });
      });
    }, 1000 * 10);
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
    await clients[clientId].whatsappClient.sendMessage(formattedPhone, message);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
});

// Serve client.html
app.get("/server", (req, res) => {
  // after build how to use
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start the server
const port = 5176;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
