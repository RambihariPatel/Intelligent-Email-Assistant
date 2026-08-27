import { GoogleGenAI } from '@google/genai';

export const summarizeEmail = async (emailContent: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Please provide a concise and clear summary of the following email thread:\n\n${emailContent}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const generateReply = async (emailContent: string, tone: string = 'professional') => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are a helpful AI email assistant. Write a ${tone} reply to the following email thread. The reply should be ready to send (without placeholders if possible) and should sound natural.\n\nEmail Thread:\n${emailContent}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const extractActionItems = async (emailContent: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `You are an AI assistant. Please extract all the Action Items, Tasks, and Deadlines from the following email thread. Format them as a clean Markdown list with bullet points. If there are no action items, simply reply with "No action items found in this email."\n\nEmail Thread:\n${emailContent}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

export const detectSpam = async (emailContent: string, sender: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Analyze this email for spam, phishing, or scams.
Sender: ${sender}
Email Content:
${emailContent}

Return ONLY a valid JSON object with exactly two fields:
{
  "isSpam": true or false,
  "reason": "Short explanation why"
}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  const text = response.text || "{}";
  const cleaned = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return { isSpam: false, reason: "Could not parse AI response." };
  }
};

export const categorizeEmail = async (subject: string, snippet: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Based on the subject and snippet, categorize this email into EXACTLY ONE of these categories:
- High Priority (Urgent matters, important meetings, immediate action)
- Newsletter (Subscriptions, marketing, articles)
- Transaction (Receipts, bills, orders)
- Update (Social media, minor notifications)
- Job/Career (Recruitment, LinkedIn, applications)
- Spam/Promo (Advertisements, junk)

Subject: ${subject}
Snippet: ${snippet}

Return ONLY the category name from the list above, nothing else.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return response.text?.trim() || "Update";
};
