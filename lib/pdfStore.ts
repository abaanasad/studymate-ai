export let uploadedPdfText = "";

export function setUploadedPdfText(text: string) {
  uploadedPdfText = text;
}

export function getUploadedPdfText() {
  return uploadedPdfText;
}