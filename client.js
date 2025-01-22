const WebSocket = require('ws');
const QRCode = require('qrcode');
const path = require('path');

// Retrieve clientId from command-line arguments
const clientId = process.argv[2];
if (!clientId) {
  console.error("Usage: node script.js <clientId>");
  process.exit(1);
}

const wsUrl = `wss://wa.mytime2cloud.com/ws/?clientId=${clientId}`;
// const wsUrl = `ws://159.65.223.236:5175?clientId=${clientId}`;

const ws = new WebSocket(wsUrl);

// Handle WebSocket events
ws.on('open', () => {
  console.log(`Connected to the WebSocket server with clientId: ${clientId}`);
});

ws.on('message', async (data) => {
  const json = JSON.parse(data);

  if (json.event === 'status') {
    console.log(`Status: ${json.data}`);
  }

  if (json.event === 'ready') {
    console.log(`Ready: ${json.data}`);
  }

  if (json.event === 'qr') {
    const qrCodeData = json.data;

    try {

      // Specify the output file path
      const filePath = path.join(__dirname, `${clientId}_qrCode.png`); // Save the file in the current directory

      // Generate and save the QR code as a PNG file
      await QRCode.toFile(filePath, qrCodeData, {
        color: {
          dark: '#000000',  // Black QR code
          light: '#ffffff'  // White background
        }
      });

      console.log(`QR Code saved to ${filePath}`);
    } catch (error) {
      console.error(`Error generating QR code: ${error.message}`);
    }
  }
});

ws.on('error', (error) => {
  console.error(`WebSocket error: ${error.message}`);
});

ws.on('close', () => {
  console.log('WebSocket connection closed.');
});
