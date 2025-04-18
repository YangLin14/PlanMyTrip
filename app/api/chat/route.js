import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Format the conversation into a single prompt
    const formattedMessages = messages.map(msg => {
      if (msg.role === "system") {
        return msg.content + "\n\n";
      }
      return `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}\n`;
    }).join("\n");

    // Add a prompt for the assistant to respond
    const fullPrompt = `${formattedMessages}\nAssistant: I am Tribe, your AI travel assistant. `;

    try {
      // Generate response
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up the response if it starts with "Assistant:"
      if (text.startsWith("Assistant:")) {
        text = text.substring("Assistant:".length).trim();
      }

      return NextResponse.json({ content: text });
    } catch (error) {
      console.error("Generation error:", error);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
