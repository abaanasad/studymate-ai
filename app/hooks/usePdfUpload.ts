"use client";

import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { PdfDocumentInfo, PdfUploadStatus } from "../chat/pdfTypes";

type UploadResponse =
  | {
      success: true;
      document: PdfDocumentInfo;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function usePdfUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRequestRef = useRef<XMLHttpRequest | null>(null);
  const [document, setDocument] = useState<PdfDocumentInfo | null>(null);
  const [status, setStatus] = useState<PdfUploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openFilePicker = useCallback(() => {
    if (status === "uploading") return;
    fileInputRef.current?.click();
  }, [status]);

  const uploadFile = useCallback(
    (file: File) => {
      if (!isPdfFile(file)) {
        setStatus("error");
        setError("Please upload a PDF file.");
        resetInput();
        return;
      }

      activeRequestRef.current?.abort();
      setDocument(null);
      setStatus("uploading");
      setProgress(4);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const request = new XMLHttpRequest();
      activeRequestRef.current = request;

      request.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;

        const transferProgress = Math.round(
          (event.loaded / event.total) * 82
        );
        setProgress(Math.min(88, Math.max(8, transferProgress)));
      };

      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
          setProgress((current) => Math.max(current, 90));
        }
      };

      request.onload = () => {
        activeRequestRef.current = null;

        try {
          const data = JSON.parse(request.responseText) as UploadResponse;

          if (request.status >= 200 && request.status < 300 && data.success) {
            setDocument(data.document);
            setStatus("ready");
            setProgress(100);
            setError("");
          } else {
            setDocument(null);
            setStatus("error");
            setProgress(0);
            setError(data.message || "Upload failed.");
          }
        } catch {
          setDocument(null);
          setStatus("error");
          setProgress(0);
          setError("Upload failed.");
        } finally {
          resetInput();
        }
      };

      request.onerror = () => {
        activeRequestRef.current = null;
        setDocument(null);
        setStatus("error");
        setProgress(0);
        setError("Upload failed. Please try again.");
        resetInput();
      };

      request.onabort = () => {
        activeRequestRef.current = null;
        setStatus("idle");
        setProgress(0);
        resetInput();
      };

      request.open("POST", "/api/upload");
      request.send(formData);
    },
    [resetInput]
  );

  const handleFileInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const removePdf = useCallback(async () => {
    const pdfId = document?.id;

    activeRequestRef.current?.abort();
    setDocument(null);
    setStatus("idle");
    setProgress(0);
    setError("");
    resetInput();

    if (!pdfId) return;

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfId }),
      });
    } catch {
      setError("The PDF was removed locally, but the server cache may remain until refresh.");
    }
  }, [document?.id, resetInput]);

  return {
    document,
    status,
    progress,
    error,
    fileInputRef,
    openFilePicker,
    uploadFile,
    handleFileInputChange,
    removePdf,
  };
}
