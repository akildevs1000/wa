const WebSocket = require("ws");
const express = require("express");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const url = require("url");
const cors = require("cors"); // Import cors

const { addClient, deleteClient } = require('./add_clients_script');

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

      const rawData = data.toString().trim();

        // Return if data is not valid JSON
        if (!rawData.startsWith("{") || !rawData.endsWith("}")) {
            return;
        }

      const message = JSON.parse(rawData);

      if (message.event === "auth_failure" || message.event === "disconnected") {
        console.log("🚀 ~ child.stdout.on ~ message:", message.event)
        ws.send(JSON.stringify({ event: "disconnected", data: "Disconnected" }));
        deleteClient(clientId);
      }
      else if (message.event === "ready") {
        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: "ready", data: "Online" }));
          }
        }, 30000); // Ping every 30 seconds
      } else {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    } catch (err) {
      console.error("Error parsing child process data:", err);
    }
  });

  // Handle errors from the child process
  child.stderr.on("data", (data) => {
    console.error(`Error from child process ${clientId}:`, data.toString());
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "error", data: data.toString() }));
    }
  });

  // Handle child process exit
  child.on("close", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
    delete processes[clientId];
    // deleteClient(clientId); // Ensure cleanup
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

  ws.on("close", () => {
    ws.send(
      JSON.stringify({
        event: "status",
        data: `Connection lost`,
      })
    );
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

  // Send message to child process
  processEntry.child.stdin.write(
    JSON.stringify({ event: "sendMessage", recipient, text }) + "\n"
  );

  // Listen for acknowledgment from child process
  processEntry.child.stdout.once("data", (data) => {
    try {
      const ack = JSON.parse(data.toString().trim());

      if (ack.event === "sendMessageAck") {

        console.log(`✅ ${ack.data}`);

        if (ack.success) {
          // Send success response to the HTTP client
          addClient(clientId);
          res.status(200).json({
            success: true,
            data: ack.data, // "Message sent to <recipient>."
          });
        } else {
          // Send error response to the HTTP client
          res.status(500).json({
            success: false,
            data: ack.data, // "Failed to send message: <error>."
          });
        }
      } else {
        // Handle unknown events
        res.status(500).json({
          success: false,
          data: `Unexpected event: ${ack.event}`,
        });
      }
    } catch (err) {
      // Handle JSON parsing errors
      res.status(500).json({
        success: false,
        data: `Failed to parse acknowledgment: ${err.message}`,
      });
    }
  });
});

// Start the HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server is running on http://localhost:${HTTP_PORT}`);
});

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);
