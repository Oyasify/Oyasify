import { GoogleGenAI, Modality } from "@google/genai";

// Fix: As per guidelines, assume API_KEY is pre-configured and accessible.
// The SDK will throw an error on initialization if API_KEY is missing, which is the desired behavior.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateScript = async (idea: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // FIX: Updated prompt to be a platform-agnostic scriptwriting expert.
      contents: `You are an expert scriptwriter AI. Your task is to generate a compelling and platform-optimized video script based on the user's idea: "${idea}".

      The script should be structured for maximum engagement and follow best practices for platforms like YouTube (long-form or Shorts), TikTok, or Instagram Reels. If no platform is specified, create a versatile script for a standard YouTube video.
      
      Structure the script with:
      1.  **Hook:** A captivating intro (first 3-5 seconds) to grab the viewer's attention.
      2.  **Introduction:** Briefly explain what the video is about.
      3.  **Main Content:** Broken down into key points or steps, with visual cues (e.g., "[B-roll of...]").
      4.  **Call to Action (CTA):** Encourage viewers to like, subscribe, and comment.
      5.  **Outro:** A quick, memorable sign-off.
      
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

export const chatWithOyasifyAI = async (message: string, images: {data: string, mimeType: string}[]): Promise<string> => {
  try {
    // FIX: Updated prompt to position Oyasify AI as a powerful, general-purpose assistant like ChatGPT.
    const promptText = `You are Oyasify AI, a powerful and versatile assistant, similar to models like ChatGPT. Provide helpful, accurate, and detailed responses to the user's message: "${message}"`;

    const textPart = { text: promptText };
    
    const imageParts = images.map(img => ({
        inlineData: {
            mimeType: img.mimeType,
            data: img.data,
        }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...imageParts] },
    });
    return response.text ?? "I'm not sure how to respond to that. Could you try asking in a different way?";
  } catch (error) {
    console.error("Error chatting with Oyasify AI:", error as any);
    return "Sorry, I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

export const generateImageWithOyasifyAI = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData) {
            return part.inlineData.data;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error as any);
        return null;
    }
};