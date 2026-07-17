import type { PdfChunk, PdfDocumentRecord } from "./pdfStore";

const MAX_CONTEXT_CHARS = 52000;
const MAX_RELEVANT_CHUNKS = 10;

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "answer",
  "because",
  "before",
  "chapter",
  "could",
  "define",
  "does",
  "explain",
  "find",
  "from",
  "generate",
  "give",
  "have",
  "into",
  "make",
  "mean",
  "page",
  "pages",
  "please",
  "question",
  "questions",
  "quiz",
  "summarize",
  "summary",
  "that",
  "this",
  "what",
  "where",
  "which",
  "with",
  "would",
]);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatPageRange(chunk: Pick<PdfChunk, "pageStart" | "pageEnd">) {
  return chunk.pageStart === chunk.pageEnd
    ? `p. ${chunk.pageStart}`
    : `pp. ${chunk.pageStart}-${chunk.pageEnd}`;
}

function clampPage(page: number, pageCount: number) {
  return Math.min(Math.max(page, 1), pageCount);
}

function getRequestedPages(query: string, pageCount: number) {
  const pages = new Set<number>();
  const pagePattern =
    /\b(?:p\.?|page|pages)\s*(\d{1,5})(?:\s*(?:-|to|through)\s*(\d{1,5}))?/gi;

  for (const match of query.matchAll(pagePattern)) {
    const start = clampPage(Number(match[1]), pageCount);
    const end = clampPage(Number(match[2] ?? match[1]), pageCount);
    const low = Math.min(start, end);
    const high = Math.max(start, end);

    for (let page = low; page <= high; page += 1) {
      pages.add(page);
    }
  }

  return pages;
}

function getChapterLabel(query: string) {
  const match = query.match(/\bchapter\s+([0-9]+|[ivxlcdm]+)\b/i);
  return match?.[1] ?? null;
}

function getSearchTerms(query: string) {
  const terms = query
    .toLowerCase()
    .match(/[a-z0-9][a-z0-9-]{2,}/g);

  if (!terms) return [];

  return Array.from(new Set(terms)).filter(
    (term) => !STOP_WORDS.has(term) && term.length > 2
  );
}

function isBroadStudyRequest(query: string) {
  return /\b(summary|summarize|overview|outline|key points|main ideas|quiz|mcq|mcqs|multiple choice|flashcards?|practice questions?|important questions?|study guide|notes)\b/i.test(
    query
  );
}

function chunkOverlapsPages(chunk: PdfChunk, pages: Set<number>) {
  for (const page of pages) {
    if (page >= chunk.pageStart && page <= chunk.pageEnd) {
      return true;
    }
  }

  return false;
}

function limitByChars(chunks: PdfChunk[], maxChars = MAX_CONTEXT_CHARS) {
  const selected: PdfChunk[] = [];
  let total = 0;

  for (const chunk of chunks) {
    if (total + chunk.text.length > maxChars && selected.length > 0) break;

    selected.push(chunk);
    total += chunk.text.length;

    if (total >= maxChars) break;
  }

  return selected;
}

function selectPageChunks(document: PdfDocumentRecord, pages: Set<number>) {
  return limitByChars(
    document.chunks.filter((chunk) => chunkOverlapsPages(chunk, pages))
  );
}

function selectChapterChunks(document: PdfDocumentRecord, label: string) {
  const chapterPattern = new RegExp(
    `\\bchapter\\s+${escapeRegExp(label)}\\b`,
    "i"
  );
  const nextChapterPattern = /\bchapter\s+([0-9]+|[ivxlcdm]+)\b/i;
  const startIndex = document.chunks.findIndex((chunk) =>
    chapterPattern.test(chunk.text)
  );

  if (startIndex === -1) return [];

  const selected: PdfChunk[] = [];

  for (let index = startIndex; index < document.chunks.length; index += 1) {
    const chunk = document.chunks[index];

    if (index > startIndex && nextChapterPattern.test(chunk.text)) {
      break;
    }

    selected.push(chunk);
  }

  return limitByChars(selected);
}

function selectBroadChunks(document: PdfDocumentRecord) {
  if (document.chunks.length <= MAX_RELEVANT_CHUNKS) {
    return document.chunks;
  }

  const selectedIndexes = new Set<number>([
    0,
    1,
    document.chunks.length - 1,
  ]);
  const usableSlots = MAX_RELEVANT_CHUNKS - selectedIndexes.size;
  const step = document.chunks.length / Math.max(usableSlots, 1);

  for (let slot = 1; slot <= usableSlots; slot += 1) {
    selectedIndexes.add(Math.floor(slot * step));
  }

  return limitByChars(
    Array.from(selectedIndexes)
      .sort((a, b) => a - b)
      .map((index) => document.chunks[index])
      .filter(Boolean)
  );
}

function scoreChunk(chunk: PdfChunk, terms: string[], query: string) {
  const text = chunk.text.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();
  let score = 0;

  if (normalizedQuery.length > 12 && text.includes(normalizedQuery)) {
    score += 30;
  }

  for (const term of terms) {
    const matches = text.match(new RegExp(`\\b${escapeRegExp(term)}\\b`, "g"));
    if (matches) {
      score += matches.length;
    }
  }

  return score;
}

function selectRelevantChunks(document: PdfDocumentRecord, query: string) {
  const terms = getSearchTerms(query);

  if (terms.length === 0) {
    return limitByChars(document.chunks.slice(0, MAX_RELEVANT_CHUNKS));
  }

  const scored = document.chunks
    .map((chunk, index) => ({
      chunk,
      index,
      score: scoreChunk(chunk, terms, query),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RELEVANT_CHUNKS);

  if (scored.length === 0) {
    return selectBroadChunks(document);
  }

  const selectedIndexes = new Set<number>();

  for (const item of scored) {
    selectedIndexes.add(item.index);
    if (item.index > 0) selectedIndexes.add(item.index - 1);
    if (item.index < document.chunks.length - 1) {
      selectedIndexes.add(item.index + 1);
    }
  }

  return limitByChars(
    Array.from(selectedIndexes)
      .sort((a, b) => a - b)
      .map((index) => document.chunks[index])
  );
}

function selectChunks(document: PdfDocumentRecord, query: string) {
  const requestedPages = getRequestedPages(query, document.pageCount);
  if (requestedPages.size > 0) {
    const pageChunks = selectPageChunks(document, requestedPages);
    if (pageChunks.length > 0) return pageChunks;
  }

  const chapterLabel = getChapterLabel(query);
  if (chapterLabel) {
    const chapterChunks = selectChapterChunks(document, chapterLabel);
    if (chapterChunks.length > 0) return chapterChunks;
  }

  if (isBroadStudyRequest(query)) {
    return selectBroadChunks(document);
  }

  return selectRelevantChunks(document, query);
}

function formatChunks(chunks: PdfChunk[]) {
  let usedChars = 0;
  const sections: string[] = [];

  chunks.forEach((chunk, index) => {
    const heading = `[Excerpt ${index + 1} | ${formatPageRange(chunk)}]`;
    const remaining = MAX_CONTEXT_CHARS - usedChars - heading.length - 4;

    if (remaining <= 0) return;

    const text =
      chunk.text.length > remaining
        ? `${chunk.text.slice(0, remaining).trim()}...`
        : chunk.text;

    sections.push(`${heading}\n${text}`);
    usedChars += heading.length + text.length;
  });

  return sections.join("\n\n");
}

export function buildPdfContext(document: PdfDocumentRecord, query: string) {
  if (document.chunks.length === 0 || document.textLength === 0) {
    return `Uploaded PDF: ${document.fileName}
Pages: ${document.pageCount}

No extractable text was found in this PDF.`;
  }

  const chunks = selectChunks(document, query);
  const context = formatChunks(chunks);

  return `Uploaded PDF: ${document.fileName}
Pages: ${document.pageCount}
Extracted characters: ${document.textLength}
Selected excerpts: ${chunks.length} of ${document.chunkCount}

${context}`;
}
