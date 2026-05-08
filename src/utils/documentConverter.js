//   Extracts text from PDF/DOCX files and converts to clean Markdown via Groq AI.

import Groq from 'groq-sdk';


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


async function extractTextFromDOCX(arrayBuffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}


async function convertToMarkdownWithAI(rawText) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here') {
    throw new Error('VITE_GROQ_API_KEY is not set in the .env file.');
  }

  const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

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

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a specialized document converter that transforms raw text into clean, structured Markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const markdown = chatCompletion.choices[0]?.message?.content;
    if (!markdown) throw new Error('No content returned from Groq.');
    return markdown.trim();
  } catch (error) {
    console.error('AI conversion failed:', error);
    throw error;
  }
}


/**
 * Given a File object (PDF or DOCX), extracts its text and converts it
 * to clean Markdown using the Groq AI.
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
