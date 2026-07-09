import QRCode from "qrcode";

/**
 * Converts any data into a Base64 QR Code string
 * @param data - Any object, string, or number to encode
 * @param size - The width/height of the QR code (default 256)
 * @returns Promise<string> - Base64 data URL
 */
export const generateQRBase64 = async (
  data: unknown,
  size: number = 256
): Promise<string> => {

  const text = typeof data === "string" ? data : JSON.stringify(data);

  try {
    const base64 = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff"
      }
    });

    return base64;
  } catch (err) {
    console.error("QR generation failed:", err);
    throw err;
  }
};