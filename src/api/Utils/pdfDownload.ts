import { OpenAPI } from '@/src/src2/api';
import { getStoredSeller } from '@/src/api/session';

/**
 * Sends already-built print HTML (the same string handed to the printer
 * module) to the backend's generic /api/pdf/render endpoint and downloads
 * the resulting PDF in the browser.
 */
export async function downloadHtmlAsPdf(html: string, filename: string): Promise<void> {
  const seller = getStoredSeller();
  const res = await fetch(`${OpenAPI.BASE}/api/pdf/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(seller?.accessToken ? { Authorization: `Bearer ${seller.accessToken}` } : {}),
    },
    body: JSON.stringify({ html, filename }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate PDF (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
