import * as genai from "@google/genai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not found" });
    }

    // Para Vercel Other, req.body já vem parseado se for JSON
    let body = req.body;
    if (!body) {
      // fallback: ler como texto
      body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => resolve(data));
        req.on("error", reject);
      });
      body = JSON.parse(body || "{}");
    }

    const { prompt } = body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Cria o cliente do Google Gemini
    const client = new genai.GoogleGenAI({ apiKey });

    // Gera o conteúdo com o modelo Gemini
    const response = await client.generateText({
      model: "gemini-1.5-flash",
      prompt,
    });

    const output = response.output_text || response[0]?.content || "";

    return res.status(200).json({ text: output });
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
