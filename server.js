const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const url = require("url");
const cors = require("cors"); // Import cors
const rimraf = require("rimraf"); // Import rimraf package

const fs = require("fs");
const path = require("path");


const app = express();
const HTTP_PORT = 5176; // HTTP server port
const WS_PORT = 5175; // WebSocket server port

const processes = {};

app.use(cors());
app.use(bodyParser.json());

// Set up WebSocket server
const wss = new WebSocket.Server({ port: WS_PORT });

// Function to run a script with a specific argument
function runScript(clientId, ws) {
  if (processes[clientId]) {
    processes[clientId].child.kill();
    delete processes[clientId];
  }

  const child = spawn("node", ["app.js", clientId]);

  processes[clientId] = { child, ws };

  // Handle messages from the child process
  child.stdout.on("data", (data) => {
    try {
      const message = JSON.parse(data.toString().trim());
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    } catch (err) {
      console.error("Error parsing child process data:", err);
    }
  });

  // Handle errors from the child process
  child.stderr.on("data", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });

  // Handle child process exit
  child.on("close", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
    delete processes[clientId];
  });
}

// Handle WebSocket connections
wss.on("connection", (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const clientId = queryParams.clientId;

  if (clientId) {
    ws.send(
      JSON.stringify({
        event: "status",
        data: `Connecting to WhatsApp...`,
      })
    );

    runScript(clientId, ws);
  } else {
    ws.send(
      JSON.stringify({
        event: "status",
        data: "Client connected without a clientId.",
      })
    );
  }

  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "ready", data: "Online" }));
    }
  }, 30000); // Ping every 30 seconds

  ws.on("close", () => {
    //   if (processes[clientId]) {
    //     processes[clientId].child.kill();
    //     delete processes[clientId];
    //   }
    //   console.log(`WebSocket client "${clientId}" disconnected.`);
  });
});

// Add an HTTP endpoint to send messages
app.post("/send-message", (req, res) => {
  const { clientId, recipient, text } = req.body;

  if (!clientId || !recipient || !text) {
    return res.status(400).json({
      success: false,
      data: "Missing required fields: clientId, recipient, text",
    });
  }

  const processEntry = processes[clientId];

  if (!processEntry) {
    return res.status(404).json({
      success: false,
      data: `WhatsApp client not found or not connected.`,
    });
  }

  try {
    processEntry.child.stdin.write(
      JSON.stringify({
        event: "sendMessage",
        recipient,
        text,
      }) + "\n"
    );

    res.status(200).json({
      success: true,
      data: `Message to ${recipient} is being processed.`,
    });
  } catch (err) {
    console.error("Error sending message via API:", err);
    res.status(500).json({
      success: false,
      data: "Failed to send message.",
      error: err.message,
    });
  }
});

app.post("/whatsapp-destroy", (req, res) => {
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({
      success: false,
      data: "Missing required fields: clientId",
    });
  }

  const processEntry = processes[clientId];

  if (!processEntry) {
    return res.status(404).json({
      success: false,
      data: `WhatsApp client not found or not connected.`,
    });
  }

  try {

    ws.send(JSON.stringify({
      event: "ready",
      data: `You can only delete whatsapp from your phone.`,
    }));


    res.status(200).json({
      success: true,
      data: `You can only delete whatsapp from your phone.`,
    });
  } catch (err) {
    console.error("Error sending message via API:", err);
    res.status(500).json({
      success: false,
      data: "Failed to send message.",
      error: err.message,
    });
  }
});

// Start the HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server is running on http://localhost:${HTTP_PORT}`);
});

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
