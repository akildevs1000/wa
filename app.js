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
    // headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "/snap/bin/chromium", // Replace with your Chromium path
  },
});

// Ensure cleanup on process exit or interruption
process.on("exit", () => {
  client.destroy();
  sendToParent({ event: "SIGINT", data: `Process exited` });
});

process.on("SIGINT", () => {
  client.destroy().then(() => {
    sendToParent({ event: "SIGINT", data: `Process exited` });
    process.exit(0);
  });
});

// Display QR code for authentication
client.on("qr", (qr) => {
  sendToParent({ event: "qr", data: qr });
});

// Confirm when the Online
client.on("ready", () => {
  sendToParent({ event: "ready", data: `Online` });
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

    if (message.event === "destroy") {
      sendToParent({
        event: "status",
        data: "You can only delete whatsapp from your phone.",
      });

    }

    if (message.event === "sendMessage") {
      const { recipient, text } = message;

      if (!recipient || !text) {
        sendToParent({
          event: "error",
          data: "Recipient and text are required to send a message.",
        });
        return;
      }

      const recipientId = `${recipient}@c.us`;

      client
        .sendMessage(recipientId, text)
        .then(() => {
          sendToParent({
            event: "sendMessageAck",
            success: true,
            data: `Message sent to ${recipient}.`,
          });
        })
        .catch((err) => {
          sendToParent({
            event: "sendMessageAck",
            success: false,
            data: `Failed to send message: ${err.message}`,
          });
        });
    } else {
      sendToParent({
        event: "error",
        data: `Unknown event: ${message.event}`,
      });

    }
  } catch (err) {
    sendToParent({
      event: "error",
      data: `Invalid message format: ${err.message}`,
    });
  }
});

client.initialize();
