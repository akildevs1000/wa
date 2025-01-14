// utils/deviceId.js
export function getOrCreateDeviceId() {
  const storageKey = "device_id";
  let deviceId = localStorage.getItem(storageKey);

  if (!deviceId) {
    deviceId = generateDeviceId(); // Generate a new ID
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
}

function generateDeviceId() {
  // Generate a simple unique identifier using random numbers and timestamps
  return (
    Math.random().toString(36).substr(2, 9) + Date.now().toString(36) // Timestamp part
  );
}
