const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");

// Get clientId from command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("clientId is required");
  process.exit(1);
}

const clientId = args[0]; // First argument: client ID

// Function to send messages to the parent process
function sendToParent(data) {
  process.stdout.write(JSON.stringify(data));
}

// Initialize the client with a unique clientId for session management
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: clientId, // Use the provided client ID
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/snap/bin/chromium", // Replace with your Chromium path
  },
});

// Ensure cleanup on process exit or interruption
process.on("exit", () => client.destroy());

process.on("SIGINT", () => {
  client.destroy().then(() => process.exit(0));
});

// Display QR code for authentication
client.on("qr", (qr) => {
  sendToParent({ event: "qr", data: qr });
});

// Confirm when the client is ready
client.on("ready", () => {
  sendToParent({ event: "ready", data: `Client is ready!` });
});

// Handle authentication failure
client.on("auth_failure", (msg) => {
  sendToParent({ event: "auth_failure", data: msg });
});

// Handle disconnection
client.on("disconnected", (reason) => {
  sendToParent({ event: "disconnected", data: reason });
});

process.stdin.on("data", (data) => {
  try {
    const message = JSON.parse(data.toString().trim());

    if (message.event === "sendMessage") {
      const { recipient, text } = message;

      if (!recipient || !text) {
        sendToParent(
          "error",
          "Recipient and text are required to send a message."
        );
        return;
      }

      const recipientId = `${recipient}@c.us`;

      client
        .sendMessage(recipientId, text)
        .then(() => {
          sendToParent({
            event: "sendMessage",
            data: `Message sent`,
          });
        })
        .catch((err) => {
          sendToParent({
            event: "sendMessage",
            data: `Unknown action: ${err.message}`,
          });
        });
    } else {
      sendToParent({
        event: "sendMessage",
        data: `Unknown action: ${message.action}`,
      });
    }
  } catch (err) {
    sendToParent({
      event: "sendMessage",
      data: "Invalid message format. Expected JSON.",
    });
  }
});

// Start the client
client.initialize();
