export type PdfDocumentInfo = {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  textLength: number;
  chunkCount: number;
  uploadedAt: string;
};

export type PdfUploadStatus = "idle" | "uploading" | "ready" | "error";
