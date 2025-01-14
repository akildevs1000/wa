<template>
  <v-container>
    <v-row class="mb-3">
      <!----- <v-col cols="12" v-if="qrImage">
        <v-img :src="qrImage"></v-img>
      </v-col>
      ----->
      <v-col cols="12">
        <h1>Whatsapp Proxy</h1>
      </v-col>
      <!-- <v-col cols="4">
        <v-text-field
          label="Server URL"
          v-model="serverUrl"
          outlined
          dense
          hide-details
        />
      </v-col>
      <v-col>
        <v-btn v-if="isConnected" color="red" dark @click="disconnect"
          >Disonnect</v-btn
        >
        <v-btn
          v-else
          :loading="loading"
          color="primary"
          @click="connectToWebSocket"
          >Connect</v-btn
        >
      </v-col> -->

      <v-col cols="12">
        <p class="mt-3" dense flat v-if="loading">Waiting for connection...</p>

        <!-- Loading Indicator -->

        <!-- QR Code -->
        <v-row v-if="qrCodeUrl" class="">
          <v-col>
            <v-img :src="qrCodeUrl" max-width="300" />
          </v-col>
        </v-row>

        <!-- Status Message -->
        <v-row v-if="statusMessage" class="">
          <v-col cols="4">
            <div class="white ma-2" dense>
              <v-badge
                x-small
                dense
                hide-details
                :color="statusColor"
                class="mr-5"
              ></v-badge>
              <span>{{ statusMessage }}</span>
            </div>
          </v-col>
        </v-row>

        <!-- API Usage Example -->
        <v-row>
          <v-col>
            <v-card>
              <v-container class="pa-5">
                <h3 class="white">API Usage Example</h3>
                <p class="black white--text pa-2 my-3">
                  <strong>Endpoint:</strong>
                  <code> {{ endpoint }}</code>
                </p>
                <div class="black white--text pa-2">Request</div>
                <pre class="black white--text pa-2 mb-3">
{
  "clientId": "{{ clientId }}",
  "phone": "971xxxxxxxxx",
  "message": "test message"
}
</pre
                >
                <div class="black white--text pa-2">Request</div>
                <pre class="black white--text pa-2 mb-3">
{
  "success": true,
  "message": "Message sent successfully!"
}
</pre
                >
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { getOrCreateDeviceId } from "~/utils/deviceId";
import { generateQrCode } from "~/utils/qrcodeGenerator";

export default {
  auth: false,
  layout: "guest",
  data() {
    return {
      loading: false,
      ws: null, // WebSocket instance
      clientId: "",
      serverUrl: "wss://wa.mytime2cloud.com/ws/",
      endpoint: "wa.mytime2cloud.com/api/send-message",
      qrCodeUrl: "",
      statusMessage: "",
      statusColor: "",
      loading: false,
      isConnected: false,

      qrImage: null,
    };
  },
  async mounted() {
    this.connectToWebSocket();

    const deviceId = getOrCreateDeviceId();
    this.qrImage = await generateQrCode(deviceId); // Generate and display the QR code
    console.log("🚀 ~ mounted ~ this.qrImage:", this.qrImage);
  },
  methods: {
    disconnect() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Notify the server to disconnect the WhatsApp client
        this.ws.send(
          JSON.stringify({
            type: "disconnect",
            clientId: localStorage.getItem("clientId"), // Pass the unique clientId
          })
        );

        // Update the UI to reflect the disconnection
        this.statusMessage = "Disconnected from WhatsApp.";
        this.statusColor = "warning";
        this.qrCodeUrl = "";

        localStorage.removeItem("clientId");

        console.log("WhatsApp client disconnected.");
      } else {
        console.warn("WebSocket is not open or already disconnected.");
        this.statusMessage =
          "No active connection to disconnect from WhatsApp.";
        this.statusColor = "error";
      }
    },

    connectToWebSocket() {
      // Initialize clientId to an empty string
      this.clientId = "";

      // Check if a clientId exists in localStorage
      let clientId = localStorage.getItem("clientId");

      if (!clientId) {
        // If no clientId exists, generate a new one
        clientId = `client_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("clientId", clientId);
      }

      // Assign the existing or newly generated clientId
      this.clientId = clientId;

      if (!this.serverUrl.trim()) {
        alert("Please enter a valid WebSocket server URL.");
        return;
      }

      this.ws = new WebSocket(`${this.serverUrl}?clientId=${clientId}`);
      this.loading = true;

      this.ws.onopen = () => {
        console.log("WebSocket connection established.");
        this.ws.send(JSON.stringify({ type: "clientId", clientId }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "qr") {
          this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            data.qr
          )}`;
          this.statusMessage = "Scan the QR code to connect.";
          this.loading = false;
          this.statusColor = "red";
        } else if (data.type === "clientId") {
          this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            data.qr
          )}`;
          this.statusMessage = "Scan the QR code to connect.";
          this.loading = false;
          this.statusColor = "red";
        } else if (data.type === "status" && data.ready) {
          console.log("🚀 ~ connectToWebSocket ~ data:", data);
          this.statusMessage = data.message;
          this.statusColor = "success";
          this.qrCodeUrl = "";
          this.loading = false;
          this.isConnected = false;
          this.clientId = clientId;
        } else if (data.type === "error") {
          this.statusMessage = `Error: ${data.message}`;
          this.statusColor = "error";
          this.qrCodeUrl = "";
          this.loading = false;
        }
      };

      // this.ws.onclose = () => {
      //   console.log("WebSocket connection closed.");
      //   this.statusMessage = "Connection lost. Please refresh the page.";
      //   this.statusColor = "error";
      //   this.loading = false;
      // };
    },
    reloadPage() {
      location.reload();
    },
  },
};
</script>
