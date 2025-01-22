const axios = require("axios");


axios.post(`your_endpoint`, {
    "clientId": "client_id",
    "phone": "971xxxxxxxxx",
    "message": "test message"
})
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        if (error.response) {
            // Server responded with a status other than 2xx
            console.log("Error response data:", error.response.data);
            console.log("Error status code:", error.response.status);
        } else if (error.request) {
            // Request was made, but no response received
            console.log("No response received:", error.request);
        } else {
            // Other errors
            console.log("Error message:", error.message);
        }
    });
