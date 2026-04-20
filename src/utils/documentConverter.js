/**
 * documentConverter.js
 * Extracts text from PDF/DOCX files and converts to clean Markdown via Gemini AI.
 */

// ── PDF extraction ──────────────────────────────────────────────────────────
async function extractTextFromPDF(arrayBuffer) {
  // Dynamic import keeps the large pdfjs bundle out of the initial chunk
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageTexts = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}

// ── DOCX extraction ─────────────────────────────────────────────────────────
async function extractTextFromDOCX(arrayBuffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// ── Gemini AI conversion ────────────────────────────────────────────────────
async function convertToMarkdownWithAI(rawText) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in the .env file.');
  }

  const prompt = `Convert the following extracted document text into clean, well-structured Markdown.

Instructions:
- Use appropriate headings (# ## ###) to reflect the document's structure
- Format lists as bullet points or numbered lists
- Bold any important terms or headings
- Preserve paragraph breaks
- Do NOT wrap the entire output in a code block
- Return only the Markdown content, nothing else

Document text:
${rawText}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  const markdown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!markdown) throw new Error('No content returned from AI.');
  return markdown.trim();
}

// ── Public API ───────────────────────────────────────────────────────────────
/**
 * Given a File object (PDF or DOCX), extracts its text and converts it
 * to clean Markdown using the Gemini API.
 * @param {File} file
 * @returns {Promise<string>} Markdown string
 */
export async function convertDocumentToMarkdown(file) {
  const arrayBuffer = await file.arrayBuffer();

  let rawText = '';

  if (file.name.endsWith('.pdf')) {
    rawText = await extractTextFromPDF(arrayBuffer);
  } else if (file.name.endsWith('.docx')) {
    rawText = await extractTextFromDOCX(arrayBuffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }

  if (!rawText.trim() || rawText.trim().length < 30) {
    throw new Error('Could not extract meaningful text from the file. The document may be image-based or empty.');
  }

  return convertToMarkdownWithAI(rawText);
}
