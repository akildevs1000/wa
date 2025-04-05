const WebSocket = require('ws');
const QRCode = require('qrcode-terminal'); // Use qrcode-terminal for terminal display
const path = require('path');
const fs = require('fs');
require('dotenv').config();


// Retrieve clientId from command-line arguments
const clientId = process.argv[2];
if (!clientId) {
  console.error("Usage: node script.js <clientId>");
  process.exit(1);
}

let ws;

let wsUrl = `wss://wa.mytime2cloud.com/ws/?clientId=${clientId}`;

if (process.env.ENV) {
  wsUrl = `ws://localhost:5175?clientId=${clientId}`;
}

console.log("🚀 ~ wsUrl:", wsUrl)


let isManuallyClosed = false;

// Helper function to get the current timestamp
const getTimestamp = () => {
  return new Date().toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
};

// Path for the CSV log file
const csvFilePath = path.join(__dirname, `${clientId}_logs.csv`);

// Write CSV headers if the file does not exist
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'Timestamp,Event,Data\n', { encoding: 'utf8' });
}

// Function to log events to the CSV file
const logToCSV = (timestamp, event, data) => {
  const csvLine = `"${timestamp}","${event}","${data.replace(/"/g, '""')}"\n`;
  fs.appendFile(csvFilePath, csvLine, (err) => {
    if (err) console.error(`[${getTimestamp()}] Error writing to CSV: ${err.message}`);
  });
};

const connectWebSocket = () => {
  ws = new WebSocket(wsUrl);

  // Handle WebSocket events
  ws.on('open', () => {
    const message = `[${getTimestamp()}] Connected to the WebSocket server with clientId: ${clientId}`;
    console.log(message);
    logToCSV(getTimestamp(), 'open', message);
  });

  ws.on('message', async (data) => {
    console.log("🚀 ~ ws.on ~ data:", data.toString())
    const json = JSON.parse(data);

    if(!json) return;

    console.log(json);

    if (json.event === 'status') {
      const message = `[${getTimestamp()}] Status: ${json.data}`;
      console.log(message);
      logToCSV(getTimestamp(), 'status', json.data);
    }

    if (json.event === 'ready') {
      const message = `[${getTimestamp()}] ${json.data}`;
      console.log(message);
      logToCSV(getTimestamp(), 'ready', json.data);
    }

    if (json.event === 'qr') {
      const qrCodeData = json.data;

      try {
        // Display the QR code in the terminal with a smaller size
        // console.log(`[${getTimestamp()}] QR Code:`);
        QRCode.generate(qrCodeData, { small: true }); // Use `small: true` for a smaller QR code
        logToCSV(getTimestamp(), 'qr', 'QR Code displayed in terminal');
      } catch (error) {
        const errorMessage = `[${getTimestamp()}] Error generating QR code: ${error.message}`;
        console.error(errorMessage);
        logToCSV(getTimestamp(), 'error', error.message);
      }
    }
  });

  ws.on('error', (error) => {
    const errorMessage = `[${getTimestamp()}] WebSocket error: ${error.message}`;
    console.error(errorMessage);
    logToCSV(getTimestamp(), 'error', error.message);
  });

  ws.on('close', () => {
    const message = `[${getTimestamp()}] WebSocket connection closed.`;
    console.log(message);
    logToCSV(getTimestamp(), 'close', 'Connection closed');

    // Reconnect only if the closure wasn't manually triggered
    if (!isManuallyClosed) {
      const reconnectMessage = `[${getTimestamp()}] Attempting to reconnect in 5 seconds...`;
      console.log(reconnectMessage);
      logToCSV(getTimestamp(), 'reconnect', 'Attempting to reconnect in 5 seconds');
      setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
    }
  });
};

// Start the WebSocket connection
connectWebSocket();

// Gracefully handle process termination
process.on('SIGINT', () => {
  const message = `[${getTimestamp()}] Closing WebSocket connection...`;
  console.log(message);
  logToCSV(getTimestamp(), 'close', 'Process terminated');
  isManuallyClosed = true;
  ws.close();
  process.exit(0);
});