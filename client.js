const WebSocket = require('ws');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Retrieve clientId from command-line arguments
const clientId = process.argv[2];
if (!clientId) {
  console.error("Usage: node script.js <clientId>");
  process.exit(1);
}

let ws;
const wsUrl = `wss://wa.mytime2cloud.com/ws/?clientId=${clientId}`;
// const wsUrl = `ws://159.65.223.236:5175?clientId=${clientId}`;

let isManuallyClosed = false;

// Helper function to get the current timestamp
const getTimestamp = () => {
  return new Date().toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sssZ
};

let counter = 0;

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
    const json = JSON.parse(data);

    if (json.event === 'status') {
      const message = `[${getTimestamp()}] Status: ${json.data}, Counter: ${++counter}`;
      console.log(message);
      logToCSV(getTimestamp(), 'status', json.data);
    }

    if (json.event === 'ready') {
      const message = `[${getTimestamp()}] ${json.data}`;
      console.log(message);
      logToCSV(getTimestamp(), 'ready', json.data);
    }


    if (json.event === 'heartbeat') {
      const message = `[${getTimestamp()}] ${json.data}`;
      console.log(message);
      logToCSV(getTimestamp(), 'heartbeat', json.data);
    }

    if (json.event === 'qr') {
      const qrCodeData = json.data;

      try {
        // Specify the output file path
        const filePath = path.join(__dirname, `${clientId}_qrCode.png`); // Save the file in the current directory

        // Generate and save the QR code as a PNG file
        await QRCode.toFile(filePath, qrCodeData, {
          color: {
            dark: '#000000', // Black QR code
            light: '#ffffff', // White background
          },
        });

        const message = `[${getTimestamp()}] QR Code saved to ${filePath}`;
        console.log(message);
        logToCSV(getTimestamp(), 'qr', `QR Code saved to ${filePath}`);
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
