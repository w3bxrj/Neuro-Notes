const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'this', 'but', 'not',
  'what', 'why', 'when', 'where', 'how', 'who', 'which', 'there', 'their', 'about', 'would', 'could', 'should',
  'can', 'into', 'some', 'than', 'then', 'they', 'them', 'these', 'those', 'also', 'just', 'like', 'over', 'out', 'only', 'very', 'even', 'does', 'did', 'have', 'had', 'been', 'much', 'many', 'more', 'most', 'other', 'such'
]);

function tokenize(text) {
  if (!text) return [];
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return words.filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function calculateJaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

export function calculateSimilarity(noteA, noteB) {
  let score = 0;


  if (noteA.tags && noteB.tags) {
    const tagsA = new Set(noteA.tags.map(t => t.toLowerCase()));
    const tagsB = new Set(noteB.tags.map(t => t.toLowerCase()));
    const sharedTags = [...tagsA].filter(x => tagsB.has(x)).length;
    score += sharedTags * 0.4;
  }


  const titleTokensA = new Set(tokenize(noteA.title));
  const titleTokensB = new Set(tokenize(noteB.title));
  const titleSimilarity = calculateJaccard(titleTokensA, titleTokensB);
  score += titleSimilarity * 0.3;


  const contentTokensA = new Set(tokenize(noteA.content));
  const contentTokensB = new Set(tokenize(noteB.content));
  const contentSimilarity = calculateJaccard(contentTokensA, contentTokensB);
  score += contentSimilarity * 0.3;

  return Math.min(1.0, score);
}

import Groq from "groq-sdk";

export async function generateSummary(text) {
  if (!text || text.length < 50) return "Content is too short to generate a meaningful summary.";

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === 'gsk_your_groq_api_key_here') {
    throw new Error("VITE_GROQ_API_KEY is not set. Please provide a valid Groq API key in the .env file.");
  }

  const groq = new Groq({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Since this is a client-side app
  });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes notes into 2-3 concise sentences."
        },
        {
          role: "user",
          content: "Summarize this note in 2-3 concise sentences:\n\n" + text
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const summary = chatCompletion.choices[0]?.message?.content;
    
    if (!summary) {
      throw new Error("Invalid response format from Groq API.");
    }

    return summary.trim();
  } catch (error) {
    console.error("AI summarization failed:", error);
    throw error;
  }
}

export function extractRelatedTopics(text, existingTags = []) {
  if (!text) return [];
  const tokens = tokenize(text).filter(t => t.length > 3);
  
  const tagsSet = new Set(existingTags.map(t => t.toLowerCase()));
  const frequencyMap = {};
  
  tokens.forEach(token => {
     if (!tagsSet.has(token)) {
       frequencyMap[token] = (frequencyMap[token] || 0) + 1;
     }
  });

  const sortedTopics = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a]);
  
  return sortedTopics.slice(0, 3).map(word => word.charAt(0).toUpperCase() + word.slice(1));
}
