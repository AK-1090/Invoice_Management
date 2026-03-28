// src/services/pdf.js
export async function downloadInvoicePdf(invoiceId, template = "template1") {
  const url = `/api/invoices/${invoiceId}/pdf?template=${template}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `Failed to download PDF (${res.status})`);
  }

  const blob = await res.blob();
  const filename = `invoice-${invoiceId}-${template}.pdf`;

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}
