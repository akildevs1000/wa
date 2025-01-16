const { Client, LocalAuth } = require("whatsapp-web.js");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Get the clientId passed as a command-line argument
const clientId = process.argv[2];

if (!clientId) {
  console.error("Client ID is required");
  process.exit(1);
}

console.log(`Initializing WhatsApp client for ${clientId}`);

// Create a new WhatsApp client
const whatsappClient = new Client({
  authStrategy: new LocalAuth({ clientId }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/snap/bin/chromium", // Replace with your Chromium path
    // executablePath:
    //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Replace with your Chromium path
  },
});

// Add event listeners
whatsappClient.on("qr", (qr) => {
  if (process.send) {
    process.send({ type: "qr", qr, clientId });
  }
});

whatsappClient.on("ready", () => {
  if (process.send) {
    process.send({ type: "status", message: `Client ${clientId} is ready.` });
  }
});

whatsappClient.on("auth_failure", (message) => {
  if (process.send) {
    process.send({
      type: "status",
      message: `Client ${clientId} authentication failed: ${message}`,
    });
  }
});

whatsappClient.on("disconnected", (reason) => {
  if (process.send) {
    process.send({
      type: "status",
      message: `Client ${clientId} authentication failed: ${message}`,
    });
  }
  process.exit(1); // Exit the process when disconnected
});

// Initialize WhatsApp client
whatsappClient.initialize();

// Handle incoming messages for this client
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  // Handle incoming messages from the main server
  const data = JSON.parse(input);
  const { phone, message } = data;
  whatsappClient
    .sendMessage(phone, message)
    .then(() => {
      console.log(`Message sent to ${phone}: ${message}`);
    })
    .catch((err) => {
      console.error(`Failed to send message: ${err.message}`);
    });
});
