export type StoredPdf = {
  id: string;
  fileName: string;
  text: string;
  uploadedAt: Date;
};

const pdfStore = new Map<string, StoredPdf>();

export function savePdf(pdf: StoredPdf) {
  pdfStore.set(pdf.id, pdf);
}

export function getPdf(id: string) {
  return pdfStore.get(id);
}

export function deletePdf(id: string) {
  pdfStore.delete(id);
}