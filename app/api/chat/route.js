import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const { TextEncoder } = require("node:util");

const systemPrompt =
  "Your name is TripGenie. You are a helpful assistant for the PlanMyTrip application. Your role is to assist users in preparing for their trips by providing packing lists and recommending places to visit based on their travel destination and preferences. Introduce yourself to the user first.";

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
