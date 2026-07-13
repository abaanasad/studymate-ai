"use client";

import { useRef, useState } from "react";

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");

  async function uploadFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setFileName(data.fileName);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Upload failed.");
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-black p-4">
      <div className="mx-auto max-w-4xl">

        {fileName && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-3 text-sm">
            <span>📄 {fileName}</span>

            <button
              onClick={() => setFileName("")}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-3">

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Message StudyMate AI..."
            rows={2}
            className="flex-1 resize-none rounded-xl bg-zinc-900 p-4 text-white outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={uploadFile}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-zinc-800 px-4 text-xl text-white hover:bg-zinc-700"
            title="Upload PDF"
          >
            +
          </button>

          <button
            onClick={onSend}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>

        </div>
      </div>
    </div>
  );
}