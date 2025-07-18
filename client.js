const WebSocket = require('ws');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pm2 = require("pm2");

let maxRetry = 0

// Retrieve clientId from command-line arguments
const clientId = process.argv[2];
if (!clientId) {
  console.error("Usage: node script.js <clientId>");
  process.exit(1);
}

let ws;
const wsUrl = `wss://wa.mytime2cloud.com/ws/?clientId=${clientId}`;
// const wsUrl = `ws://localhost:5175?clientId=${clientId}`;

let isManuallyClosed = false;

// Helper function to get the current timestamp
const getTimestamp = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
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
    // logToCSV(getTimestamp(), 'open', message);
  });

  // Set a 1-minute timeout for the "ready" event
  let readyTimeout = setTimeout(() => {
    console.error(getTimestamp(), 'status', "Timeout: No 'ready' event received. Exiting...");
    // logToCSV(getTimestamp(), 'status', "Timeout: No 'ready' event received. Exiting...");

    console.log("Stopping process:", clientId);

    pm2.stop(clientId, (err) => {
      if (err) {
        console.error(`Error stopping process for ${clientId}:`, err);
        return;
      }

      console.log(`stopped for ${clientId}`);
    });

  }, 30 * 60 * 1000); // 60 seconds

  ws.on('message', async (data) => {
    const json = JSON.parse(data);

    if (json.event === 'status') {
      const message = `[${getTimestamp()}] Status: ${json.data}`;
      // how to exit if it takes more time
      console.log(message);
      // logToCSV(getTimestamp(), 'status', json.data);
    }

    if (json.event === 'ready') {
      clearTimeout(readyTimeout); // Stop the timeout when "ready" event is received
      const message = `[${getTimestamp()}] ${json.data}`;
      console.log(message);
      logToCSV(getTimestamp(), 'ready', json.data);
    }


    if (json.event === 'heartbeat') {
      const message = `[${getTimestamp()}] ${json.data}`;
      console.log(message);
      // logToCSV(getTimestamp(), 'heartbeat', json.data);
    }

    if (json.event === 'qr') {
      maxRetry++;

      if (maxRetry > 5) {
        console.log(getTimestamp(), 'status', "Retry limit exceed");
        // logToCSV(getTimestamp(), 'status', "Retry limit exceed");

        console.log("Stopping process:", clientId);

        pm2.stop(clientId, (err) => {
          if (err) {
            console.error(`Error stopping process for ${clientId}:`, err);
            return;
          }

          console.log(`stopped for ${clientId}`);
        });
      }
      console.log(`Qr code not allowed here`);
      console.log(getTimestamp(), 'status', "Exited. Tried " + maxRetry + " Times");
      // logToCSV(getTimestamp(), 'status', "Exited. Tried" + maxRetry + "Times");
    }
  });

  ws.on('error', (error) => {
    const errorMessage = `[${getTimestamp()}] WebSocket error: ${error.message}`;
    console.error(errorMessage);
    // logToCSV(getTimestamp(), 'error', error.message);
  });

  ws.on('close', () => {
    const message = `[${getTimestamp()}] WebSocket connection closed.`;
    console.log(message);
    // logToCSV(getTimestamp(), 'close', 'Connection closed');

    // Reconnect only if the closure wasn't manually triggered
    if (!isManuallyClosed) {
      const reconnectMessage = `[${getTimestamp()}] Attempting to reconnect in 5 seconds...`;
      console.log(reconnectMessage);
      // logToCSV(getTimestamp(), 'reconnect', 'Attempting to reconnect in 5 seconds');
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
  // logToCSV(getTimestamp(), 'close', 'Process terminated');
  isManuallyClosed = true;
  ws.close();
  process.exit(0);
});
