const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// Path to the JSON file containing client IDs
const clientsFilePath = path.join(__dirname, 'clients.json');

// Read client IDs from the JSON file
let clientIds;
try {
    const clientsData = fs.readFileSync(clientsFilePath, 'utf8');
    clientIds = JSON.parse(clientsData).clientIds;
    if (!Array.isArray(clientIds) || clientIds.length === 0) {
        throw new Error('Invalid or empty clientIds array in clients.json');
    }
} catch (error) {
    console.error(`Error reading or parsing clients.json: ${error.message}`);
    fs.appendFileSync('errors.log', `Error reading or parsing clients.json: ${error.message}`);
    process.exit(1);
}

// Helper function to get the current timestamp
const getTimestamp = () => {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Dubai" });
    const date = new Date(now);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ` +
        `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

// Function to log events to the CSV file
const logToCSV = (clientId, timestamp, event, data) => {
    const logsDir = path.join(__dirname, "logs");
    const csvFilePath = path.join(logsDir, `${clientId}.csv`);

    // Ensure logs directory exists
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    const csvLine = `"${timestamp}","${event}","${data.replace(/"/g, '""')}"\n`;

    fs.appendFile(csvFilePath, csvLine, (err) => {
        if (err) console.error(`[${new Date().toISOString()}] Error writing to CSV for client ${clientId}: ${err.message}`);
    });
};

// Function to establish a WebSocket connection for a given client ID
const connectWebSocket = (clientId) => {
    const wsUrl = `wss://wa.mytime2cloud.com/ws/?clientId=${clientId}`;
    let isManuallyClosed = false;
    let counter = 0;

    const ws = new WebSocket(wsUrl);

    // Handle WebSocket events
    ws.on('open', () => {
        const message = `[${getTimestamp()}] Connected to the WebSocket server`;
        console.log(`${message} with clientId: ${clientId}`);
        logToCSV(clientId, getTimestamp(), 'open', message);
    });

    ws.on('message', async (data) => {
        const json = JSON.parse(data);

        if (json.event === 'status') {
            const message = `[${getTimestamp()}] Status: ${json.data}, Counter: ${++counter}`;
            console.log(`${message} for client ${clientId}`);
            logToCSV(clientId, getTimestamp(), 'status', json.data);
        }

        if (json.event === 'ready') {
            console.log(`[${getTimestamp()}] ${clientId} client is ${json.data}`);
            logToCSV(clientId, getTimestamp(), 'ready', json.data);
        }
    });

    ws.on('error', (error) => {
        const errorMessage = `[${getTimestamp()}] WebSocket error for client ${clientId}: ${error.message}`;
        console.error(errorMessage);
        logToCSV(clientId, getTimestamp(), 'error', error.message);
    });

    ws.on('close', () => {
        const message = `[${getTimestamp()}] WebSocket connection closed`;
        console.log(`${message} for client ${clientId}`);
        logToCSV(clientId, getTimestamp(), 'close', 'Connection closed');

        // Reconnect only if the closure wasn't manually triggered
        if (!isManuallyClosed) {
            const message = `[${getTimestamp()}] Attempting to reconnect in 10 seconds...`;
            console.log(`${message} for client ${clientId}`);
            logToCSV(clientId, getTimestamp(), 'reconnect', message);
            setTimeout(() => connectWebSocket(clientId), 10 * 1000); // Retry after 5 seconds
        }
    });

    // Gracefully handle process termination
    process.on('SIGINT', () => {
        const message = `[${getTimestamp()}] Closing WebSocket connection...`;
        console.log(`${message} for client ${clientId}`);
        logToCSV(clientId, getTimestamp(), 'close', 'Process terminated');
        isManuallyClosed = true;
        ws.close();
        process.exit(0);
    });
};

// Start WebSocket connections for all client IDs
clientIds.forEach((clientId) => {
    connectWebSocket(clientId);
});