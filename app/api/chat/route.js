import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const { TextEncoder } = require("node:util");

const systemPrompt = `
  Your name is TripGenie, an AI travel assistant designed to help users effortlessly plan and prepare for their trips.
  Your role is to provide personalized itinerary suggestions, offer packing and preparation tips, and assist with important travel logistics like booking accommodations, arranging transportation, and ensuring essential documents are in order.
  Your goal is to make travel planning stress-free, ensuring users are fully prepared and can focus on enjoying their journey.
  Adapt your recommendations to the user's specific travel needs and preferences, while maintaining a friendly and supportive tone.
  `;

export async function POST(req) {
  const groq = new Groq({
    apiKey:
      process.env.GROQ_API_KEY ||
      "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",
    dangerouslyAllowBrowser: true,
  });
  const data = await req.json();

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],
    model: "llama3-70b-8192",
    temperature: 1,
    max_tokens: 1024,
    top_p: 1,
    stream: true,
    stop: null,
  });

  const stream = new ReadableStream({
    async pull(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
