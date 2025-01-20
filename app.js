const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

// Get clientId from command-line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error("clientId is required");
  process.exit(1);
}

const clientId = args[0]; // First argument: client ID

// Hardcoded recipient number and message
const recipientNumber = "1234567890"; // Replace with the recipient's phone number in international format
const message = "Hello, this is a test message!"; // Replace with your desired message

// Initialize the client with a unique clientId for session management
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: clientId, // Use the provided client ID
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      `--user-data-dir=/tmp/puppeteer_data_${clientId}`,
    ],
    executablePath: "/snap/bin/chromium", // Replace with your Chromium path
    // executablePath:
    //   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Replace with your Chromium path
  },
});

// Display QR code for authentication
client.on("qr", (qr) => {
  console.log(`Scan this QR code for clientId "${clientId}":`);
  qrcode.generate(qr, { small: true });
});

// Confirm when the client is ready
client.on("ready", () => {
  console.log(`WhatsApp client "${clientId}" is ready!`);

  // const recipient = `${recipientNumber}@c.us`; // Format for WhatsApp
  // client
  //   .sendMessage(recipient, message)
  //   .then(() =>
  //     console.log(
  //       `Message sent successfully to ${recipientNumber}: "${message}"`
  //     )
  //   )
  //   .catch((err) => console.error("Failed to send message:", err));
});

// Handle authentication failure
client.on("auth_failure", (msg) => {
  console.error(`Authentication failed for clientId "${clientId}":`, msg);
});

// Start the client
client.initialize();
