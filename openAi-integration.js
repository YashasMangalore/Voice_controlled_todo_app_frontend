import OpenAI from "https://cdn.skypack.dev/openai";
import { GITHUB_OPENAI_TOKEN } from "./config.js";

const token = GITHUB_OPENAI_TOKEN;

export async function main(userCommand) {
  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a task analyser. Extract the following details from the user's input: 
        1. Operation (Add/Delete/Update)
        2. Task description
        3. Urgency (High/Medium/Low)
        4. Date and time (if mentioned in yyyy-mm-ddThh:mm:ss format)

        Respond in JSON format like:
        {
            "operation": "...",
            "task": "...",
            "urgency": "...",
            "dateandtime": "..."
        }

        Do NOT wrap the JSON response in Markdown (\`\`\`json ... \`\`\`).`,
      },
      {
        role: "user",
        content: userCommand,
      },
    ],
  });

  let rawContent = response.choices[0].message.content;
  console.log("Raw AI Response:", rawContent);

  // Remove Markdown-style triple backticks if they exist
  let cleanedContent = rawContent.replace(/```json|```/g, "").trim();
  console.log("Cleaned AI Response:", cleanedContent);
  
  return JSON.parse(cleanedContent);
}