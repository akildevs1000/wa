import QRCode from "qrcode";

export async function generateQrCode(deviceId) {
  try {
    const url = await QRCode.toDataURL(deviceId, { errorCorrectionLevel: "H" });
    return url; // Return the generated URL
  } catch (err) {
    throw new Error("Error generating QR code: " + err);
  }
}
