import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateFollowUpMessage = async (followUpDto: any) => {
  const {
    name,
    metWith,
    date,
    meetingLocation,
    randomFacts,
    linkedinUrl,
    nextSteps,
  } = followUpDto;

  const prompt = `Generate a professional yet friendly follow-up message based on the following details:
    - My name: ${name}
    - Person I met: ${metWith}
    - Meeting Date: ${date ? date.toDateString() : "Not specified"}
    - Meeting Location: ${meetingLocation || "Not specified"}
    - Random Facts: ${randomFacts || "Not provided"}
    - LinkedIn Profile: ${linkedinUrl || "Not provided"}
    - Next Steps: ${nextSteps?.join(", ") || "No specific steps"} 
    
    Format the message professionally but concisely.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating follow-up message:", error);
    throw new Error("Failed to generate follow-up message.");
  }
};
