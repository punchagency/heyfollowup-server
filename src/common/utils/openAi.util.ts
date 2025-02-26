import { openai } from "../../config/openAi-config";

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

  const prompt = `Generate a friendly and professional follow-up message based on these details:
  - My name: ${name}
  - Person I met: ${metWith}
  - Meeting Date: ${date ? date.toDateString() : "Not specified"}
  - Meeting Location: ${meetingLocation || "Not specified"}
  - Discussion Topics: ${randomFacts || "Not provided"}
  - Next Steps: ${nextSteps?.join(", ") || "No specific steps"} 
  
  The message should be **concise, warm, and engaging**, similar to this structure:

  ---
  Hi [Name],  
  I wanted to follow up on our conversation at [Meeting Location/Event].  
  I really enjoyed our discussion on [Topic].  
  Let me know if you'd like to continue our chat over coffee or a call!  
  Looking forward to staying in touch.  
  Best,  
  [Your Name]  
  ---

  Adjust the tone based on the details provided while keeping it professional yet friendly.`;

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
