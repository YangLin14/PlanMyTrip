"use client";

import { useState } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";
import Groq from "groq-sdk"; // Use ES6 import syntax

const groq = new Groq({
  apiKey:
    process.env.GROQ_API_KEY ||
    "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",
  dangerouslyAllowBrowser: true,
});

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm here to help with your packing list and recommend places to go! How can I assist you today?",
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    const chatCompletion = await groq.chat.completions.create({
      messages: [...messages, { role: "user", content: message }],
      model: "llama3-70b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    const decoder = new TextDecoder();
    let result = "";

    for await (const chunk of chatCompletion) {
      const text = decoder.decode(chunk.value || new Int8Array(), {
        stream: true,
      });
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
    }
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="fixed"
      top={0}
      left={0}
      bgcolor="white"
    >
      <Stack
        direction="column"
        width="80%" // Set width for the chatbox
        height="70%" // Set height for the chatbox
        border="1px solid black"
        p={2}
        spacing={3}
        justifyContent="flex-start"
        overflow="auto"
      >
        <Stack spacing={2} flexGrow={1} overflow="auto">
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                msg.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  msg.role === "assistant" ? "primary.main" : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {msg.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Type your message here..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
