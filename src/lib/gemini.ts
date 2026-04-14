import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const chatWithAI = async (message: string, history: { role: string; content: string }[], userName: string = "Maliksaad", mode: string = "chat") => {
  let systemInstruction = `You are an advanced AI Assistant created by SigNify for ${userName}.
  Your owner is ${userName}, who lives in Sindh, Kashmore.
  You must always address them as "Sir" or "Owner".
  Be polite, efficient, and highly intelligent.`;

  if (mode === "learn") {
    systemInstruction += `\nIn "Learn Mode", you act as an expert tutor. 
    You should prioritize information and study materials from the following sources:
    - https://www.taleem360.com/
    - https://www.downloadclassnotes.com/
    - Google Search results
    - YouTube educational content
    Help the user understand complex concepts, solve problems, and provide structured notes.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, Sir. I encountered an error. Please try again.";
  }
};

export const debateWithAI = async (message: string, history: { role: string; content: string }[], userName: string = "Maliksaad") => {
  const systemInstruction = `You are Saad GPT in "Debate & Deep Dive" mode, inspired by NotebookLM.
  Your owner is ${userName}. You must always address them as "Sir" or "Owner".
  In this mode, you don't just answer questions; you challenge ideas, provide counter-arguments, and perform deep analytical dives into topics.
  Be critical, intellectual, and help ${userName} see multiple perspectives on any subject.
  Always maintain a respectful but challenging tone to stimulate deep thinking.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Debate Error:", error);
    return "I'm sorry, Sir. The debate encountered a technical issue. Let's try again.";
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
