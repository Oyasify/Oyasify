import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found" });
    }

    let body = "";

    // Necessário para Vercel (Other)
    await new Promise((resolve) => {
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", resolve);
    });

    const { prompt } = JSON.parse(body || "{}");

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // NOVO formato oficial do Google AI Studio
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",  // ← modelo correto
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
