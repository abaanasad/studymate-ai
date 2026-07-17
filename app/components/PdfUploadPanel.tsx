"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import type { PdfDocumentInfo, PdfUploadStatus } from "../chat/pdfTypes";

type PdfUploadPanelProps = {
  document: PdfDocumentInfo | null;
  status: PdfUploadStatus;
  progress: number;
  error: string;
  onBrowse: () => void;
  onFile: (file: File) => void;
  onRemove: () => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export default function PdfUploadPanel({
  document,
  status,
  progress,
  error,
  onBrowse,
  onFile,
  onRemove,
}: PdfUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = status === "uploading";

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isUploading) setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <section className="border-t border-zinc-900 bg-black px-4 py-4">
      <div className="mx-auto max-w-4xl">
        {document ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 shadow-lg shadow-emerald-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {document.fileName}
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 px-2 py-0.5 text-xs text-emerald-200">
                      <CheckCircle2 size={13} />
                      Ready
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-300">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <span>{document.pageCount} pages</span>
                    <span>{document.chunkCount} chunks</span>
                    <span>{formatNumber(document.textLength)} characters</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBrowse}
                  className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 text-red-300 transition hover:bg-red-500/10"
                  title="Remove PDF"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border border-dashed p-5 transition ${
              isDragging
                ? "border-blue-400 bg-blue-500/10"
                : "border-zinc-700 bg-zinc-950"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <UploadCloud size={25} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Upload a PDF to study with this chat
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Drag and drop a PDF here, or browse from your device.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onBrowse}
                disabled={isUploading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Upload PDF
              </button>
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>Processing PDF</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
