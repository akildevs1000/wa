const WebSocket = require("ws");
const { spawn } = require("child_process");
const url = require("url");

// Set up WebSocket server on port 5175
const wss = new WebSocket.Server({ port: 5175 });

const processes = {};

// Function to run a script with a specific argument
function runScript(clientName, ws) {
  if (processes[clientId]) {
    console.log(`Terminating existing process for clientId: ${clientId}`);
    processes[clientId].kill(); // Kill the running process
    delete processes[clientId]; // Immediately clean up the reference
  }

  const child = spawn("node", ["app.js", clientName]);

  processes[clientId] = child;

  child.stdout.on("data", (data) => {
    console.log(`[${clientName}] Output: ${data}`);
    ws.send(`[${clientName}] Output: ${data}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`[${clientName}] Error: ${data}`);
    ws.send(`[${clientName}] Error: ${data}`);
  });

  child.on("close", (code) => {
    console.log(`[${clientName}] Process exited with code: ${code}`);
    ws.send(`${code}`);
  });
}

wss.on("connection", (ws, req) => {
  const queryParams = url.parse(req.url, true).query;
  const clientId = queryParams.clientId;

  if (clientId) {
    ws.send(`Connecting.... to whatsapp`);

    runScript(clientId, ws); // Pass ws object to runScript
  } else {
    console.log("Client connected without a clientId");
  }

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:5175");
