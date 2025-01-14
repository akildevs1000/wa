const crypto = require("crypto");

const secretPassphrase = "tesing";

const iv = crypto.randomBytes(16);

const secretKey = crypto.createHash("sha256").update(secretPassphrase).digest();

// Encrypt function
function encrypt(id) {
  if (id == "") return "";

  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);
  let encrypted = cipher.update(id.toString(), "utf-8", "base64");
  encrypted += cipher.final("base64");
  let fs = encrypted.replaceAll("/", "replacer");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt function
function decrypt(encryptedText) {
  if (encryptedText == "") return "";
  const [ivHex, encrypted] = encryptedText.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    secretKey,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encrypted, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
  return parseInt(decrypted, 10);
}

export default ({ app }, inject) => {
  inject("crypto", {
    encrypt,
    decrypt,
  });
};
