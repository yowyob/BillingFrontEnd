// Mirrors quotationPrint.ts's exact A4 layout/CSS, adapted for
// BonCommandeResponse (sales order) fields.

interface OrgBranding {
  organizationLogoUri?: string;
  organizationName?: string;
  agencyAddress?: string;
  agencyCity?: string;
  taxNumber?: string;
  organizationEmail?: string;
}

export const generateBonCommandeHTML = (
  data: any,
  org: OrgBranding,
  qrBase64: string
): string => {

  const formatCurrency = (num: number = 0) =>
    new Intl.NumberFormat('en-GB').format(num) + ' ' + (data.devise || 'XAF');

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const tableRows = (data.lines ?? []).map((item: any) => `
    <tr>
        <td class="desc-col">${item.description || item.nomProduit}</td>
        <td class="text-center">${item.quantite}</td>
        <td class="text-right">${formatCurrency(item.prixUnitaire)}</td>
        <td class="text-right total-col">${formatCurrency(item.montantTotal ?? item.debit)}</td>
    </tr>
  `).join('') || '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales Order - ${data.numeroCommande}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&amp;display=swap');
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; background-color: #f1f5f9; color: #0f172a; }
        .a4-page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto; background: white; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; position: relative; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 30px; margin-bottom: 40px; }
        .brand-section { display: flex; gap: 24px; }
        .logo-placeholder { width: 80px; height: 80px; background-color: #0f172a; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 30px; overflow: hidden; }
        .logo-img { width: 100%; height: 100%; object-fit: contain; }
        .doc-title h1 { font-size: 36px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0 0 8px 0; letter-spacing: -1px; }
        .doc-ref { font-size: 12px; font-weight: 700; color: #64748b; margin: 0; }
        .seller-info { text-align: right; }
        .seller-name { font-weight: 900; font-size: 16px; text-transform: uppercase; margin: 0 0 4px 0; }
        .contact-details { font-size: 10px; color: #64748b; line-height: 1.4; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .section-label { font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; border-left: 4px solid #0f172a; padding-left: 12px; }
        .client-name { font-size: 16px; font-weight: 900; margin: 0; }
        .client-address { font-size: 12px; color: #64748b; margin-top: 4px; width: 75%; }
        .date-box { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        .date-row { display: flex; justify-content: space-between; width: 180px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
        .date-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .date-value { font-size: 12px; font-weight: 900; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        thead tr { background-color: #0f172a; color: white; }
        th { padding: 16px 20px; font-size: 9px; font-weight: 900; text-transform: uppercase; text-align: left; }
        th:first-child { border-radius: 12px 0 0 12px; }
        th:last-child { border-radius: 0 12px 12px 0; text-align: right; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        td { padding: 20px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .desc-col { font-weight: 700; color: #1e293b; }
        .total-col { font-weight: 900; }
        .footer { margin-top: auto; padding-top: 32px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: flex-end; }
        .terms { width: 55%; display: flex; gap: 24px; align-items: flex-start; }
        .terms-content { flex: 1; }
        .qr-container { flex-shrink: 0; text-align: center; background: #f8fafc; padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .terms-text { font-size: 10px; color: #64748b; font-style: italic; line-height: 1.6; }
        .totals-box { width: 288px; }
        .subtotal-row { display: flex; justify-content: space-between; padding: 0 16px; margin-bottom: 8px; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .grand-total-card { background-color: #0f172a; color: white; padding: 24px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); margin-top: 16px; }
        .total-label { display: flex; justify-content: space-between; font-size: 9px; font-weight: 900; text-transform: uppercase; opacity: 0.6; letter-spacing: 1px; margin-bottom: 4px; }
        .total-amount { font-size: 30px; font-weight: 900; text-align: right; }
        @media print { body { background: white; padding: 0; } .a4-page { box-shadow: none; margin: 0; } @page { size: A4; margin: 0; } }
    </style>
</head>
<body>
    <div class="a4-page">
        <header class="header">
            <div class="brand-section">
                <div class="logo-placeholder">
                    ${org.organizationLogoUri
                        ? `<img src="${org.organizationLogoUri}" class="logo-img" alt="Logo">`
                        : org.organizationName?.charAt(0) || 'S'}
                </div>
                <div class="doc-title">
                    <h1>Sales Order</h1>
                    <p class="doc-ref">${data.numeroCommande}</p>
                </div>
            </div>

            <div class="seller-info">
                <h2 class="seller-name">${org.organizationName ?? ''}</h2>
                <div class="contact-details">
                    <p>${org.agencyAddress ?? ''}</p>
                    <p>${org.agencyCity ?? ''}</p>
                    <p style="font-weight: 700; color: #1e293b; margin-top: 4px;">TAX ID: ${org.taxNumber || 'N/A'}</p>
                    <p style="color: #2563eb;">${org.organizationEmail ?? ''}</p>
                </div>
            </div>
        </header>

        <section class="info-grid">
            <div>
                <p class="section-label">Bon de Commande / Client</p>
                <p class="client-name">${data.nomClient}</p>
                <p class="client-address">${data.adresseClient || 'Standard Client'}</p>
            </div>
            <div class="date-box">
                <div class="date-row">
                    <span class="date-label">Order Date</span>
                    <span class="date-value">${formatDate(data.dateCommande)}</span>
                </div>
                <div class="date-row">
                    <span class="date-label">Expected Delivery</span>
                    <span class="date-value" style="color: #2563eb;">${formatDate(data.dateLivraisonPrevue)}</span>
                </div>
            </div>
        </section>

        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>

        <footer class="footer">
            <div class="terms">
                <div class="qr-container">
                    <img src="${qrBase64}" style="width: 75px; height: 75px; mix-blend-mode: multiply;" />
                    <p style="font-size: 7px; font-weight: 900; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase;">Verify Document</p>
                </div>

                <div class="terms-content">
                    <p class="section-label" style="border: none; padding: 0;">Terms & Conditions</p>
                    <p class="terms-text">${data.notes || 'This sales order is subject to the standard terms agreed with your organization. Digital approval via the portal is legally binding.'}</p>
                </div>
            </div>

            <div class="totals-box">
                <div class="subtotal-row">
                    <span>Subtotal HT</span>
                    <span>${formatCurrency(data.montantHT)}</span>
                </div>
                ${data.applyVat ? `
                <div class="subtotal-row">
                    <span>VAT</span>
                    <span>${formatCurrency(data.montantTVA)}</span>
                </div>` : ''}

                <div class="grand-total-card">
                    <div class="total-label">
                        <span>Total amount</span>
                        <span>${data.devise || 'XAF'}</span>
                    </div>
                    <div class="total-amount">${new Intl.NumberFormat('en-GB').format(data.montantTTC ?? 0)}</div>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`;
};
