import { GoogleGenAI } from "@google/genai";

// Fix: As per guidelines, assume API_KEY is pre-configured and accessible.
// The SDK will throw an error on initialization if API_KEY is missing, which is the desired behavior.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateScript = async (idea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // FIX: Updated prompt to request HTML for direct rendering, as the UI is not set up to parse Markdown.
      contents: `Generate a YouTube video script based on this idea: "${idea}". 
      
      The script should be structured with:
      1.  **Hook:** A captivating intro to grab the viewer's attention in the first 5 seconds.
      2.  **Introduction:** Briefly explain what the video is about.
      3.  **Main Content:** Broken down into 3-5 key points or steps.
      4.  **Call to Action (CTA):** Encourage viewers to like, subscribe, and comment.
      5.  **Outro:** A quick sign-off.
      
      Format the output in basic HTML using tags like <h2> for titles, <p> for paragraphs, and <strong> for emphasis. Do not include <html> or <body> tags.`,
    });
    // FIX: The .text property might be undefined if the model returns no content.
    // Provide a fallback to ensure a string is always returned, satisfying the function's return type.
    return response.text ?? "<h2>No Content</h2><p>The model did not return any content for this idea.</p>";
  } catch (error) {
    // FIX: The error object `error` from a promise rejection is of type `unknown`.
    // Casting to `any` for console.error, which can handle various types.
    console.error("Error generating script:", error as any);
    return "<h2>Error</h2><p>Sorry, an error occurred while generating the script. Please try again later.</p>";
  }
};

export const chatWithOyasifyAI = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Oyasify AI, a helpful and creative assistant for musicians and content creators. Keep your answers concise and friendly. User's message: "${message}"`,
    });
    return response.text ?? "I'm not sure how to respond to that. Could you try asking in a different way?";
  } catch (error) {
    console.error("Error chatting with Oyasify AI:", error as any);
    return "Sorry, I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};
