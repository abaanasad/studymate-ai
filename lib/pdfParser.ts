import PDFParser from "pdf2json";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      for (const page of pdfData.Pages) {
        for (const item of page.Texts) {
          for (const run of item.R) {
            text += decodeURIComponent(run.T) + " ";
          }
          text += "\n";
        }
        text += "\n\n";
      }

      resolve(text.trim());
    });

    pdfParser.parseBuffer(buffer);
  });
}