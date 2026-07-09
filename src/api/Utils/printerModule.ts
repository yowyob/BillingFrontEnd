// The standalone PrinterModule Electron app (see PROJECT/PrinterModule) hosts
// a local HTTP server on this port and routes print jobs to a real printer
// via CUPS. Every print preview modal in the app shares this one call.
const PRINTER_MODULE_URL = "http://localhost:3002/print";

export async function sendPrintRequest(html: string): Promise<any> {
  const response = await fetch(PRINTER_MODULE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html }),
  });
  return await response.json();
}
