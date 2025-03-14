const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cors = require("cors");
const { disconnect } = require("process");

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

const PORT = 5176;
const AUTH_FOLDER = path.join(__dirname, ".wwebjs_auth"); // Path to session storage

let clients = {}; // Store active clients


// Function to get stored client IDs from .wwebjs_auth
const getStoredClients = () => {
  if (!fs.existsSync(AUTH_FOLDER)) return [];
  return fs
    .readdirSync(AUTH_FOLDER)
    .filter((dir) => dir.startsWith("session-"))
    .map((dir) => dir.replace("session-", ""));
};

// Function to initialize a WhatsApp client
const initializeClient = (clientId) => {
  if (clients[clientId]) return; // Prevent re-initialization

  const client = new Client({
    authStrategy: new LocalAuth({ clientId }),
    puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });

  clients[clientId] = { qr: null, ready: false, disconnected: false };

  client.on("qr", (qr) => {
    clients[clientId].qr = qr;
  });
  client.on("ready", () => {
    clients[clientId].ready = true;
    console.log(`Client ${clientId} is ready`);
  });
  client.on("disconnected", () => {
    clients[clientId].disconnected = true;
  });

  // client
  // .sendMessage(`923108559858@c.us`, "welcome")
  // .then(() => {
  //   console.log({
  //     event: "sendMessageAck",
  //     success: true,
  //     data: `Message sent to ${recipient}.`,
  //   });
  // })
  // .catch((err) => {
  //   console.log({
  //     event: "sendMessageAck",
  //     success: false,
  //     data: `Failed to send message: ${err.message}`,
  //   });
  // });

  client.initialize();


  clients[clientId] = client;
};

const reconnectStoredClients = () => {
  const storedClients = getStoredClients();
  console.log(`🔄 Reconnecting stored clients: ${storedClients.join(", ")}`);
  storedClients.forEach(initializeClient);
};

app.post("/init", async (req, res) => {
  const { clientId } = req.body;

  if (!clientId) {
    return res.status(400).json({ success: false, message: "clientId is required" });
  }

  if (clients[clientId]) {
    return res.json({ success: true, message: "Client already initialized" });
  }

  initializeClient(clientId);
  res.json({ success: true, message: `Client ${clientId} initialization started` });
});

// Route to get QR code
app.get("/qr/:clientId", async (req, res) => {
  const { clientId } = req.params;
  console.log("🚀 ~ app.get ~ qr/:clientId:", clientId)

  if (!clients[clientId]) {
    return res.status(404).json({ success: false, message: "Client not found" });
  }

  if (!clients[clientId].qr) {
    return res.status(404).json({ success: false, message: "No QR available yet" });
  }

  if (clients[clientId].ready == true) {
    res.json({ success: true, message: "ready" });
    return;
  }

  res.json({ success: true, qr: clients[clientId].qr });
});


app.post("/send", async (req, res) => {
  const { clientId, recipient, text } = req.body;

  // Check if the client exists and is ready
  if (!clients[clientId] || !clients[clientId].ready) {
    return res.status(400).json({ success: false, message: "Client not ready or does not exist" });
  }

  try {
    console.log("Sending message to:", recipient);
    console.log(clients[clientId]);
    return; 
    await clients[clientId].client.sendMessage(`${recipient}@c.us`, text);
    res.json({ success: true, message: `Message sent to ${recipient}` });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: `Error sending message: ${error.message}` });
  }
});



reconnectStoredClients();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
