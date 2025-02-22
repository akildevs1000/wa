const fs = require('fs');

const clientsFile = 'clients.json';

// Load existing clients from JSON file
function loadClients() {
    if (fs.existsSync(clientsFile)) {
        return JSON.parse(fs.readFileSync(clientsFile));
    }
    return { clientIds: [] };
}

// Save clients to JSON file
function saveClients(clients) {
    fs.writeFileSync(clientsFile, JSON.stringify(clients, null, 2));
}

const existingClients = loadClients();

function addClient(clientId) {
    if (!existingClients.clientIds.includes(clientId)) {
        existingClients.clientIds.push(clientId);
        saveClients(existingClients);
        console.log(`Client ${clientId} added successfully.`);
    } else {
        console.log(`Client ${clientId} already exists.`);
    }
}

function deleteClient(clientId) {
    const index = existingClients.clientIds.indexOf(clientId);
    if (index !== -1) {
        existingClients.clientIds.splice(index, 1);
        saveClients(existingClients);
        console.log(`Client ${clientId} deleted successfully.`);
    } else {
        console.log(`Client ${clientId} not found.`);
    }
}

module.exports = { addClient, deleteClient, loadClients };
