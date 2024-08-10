"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import Head from "next/head";
import ReactMarkdown from "react-markdown"; // Import ReactMarkdown for rendering markdown

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm here to help with your packing list and recommend places to go! How can I assist you today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function proccessText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(proccessText);
      });
    });
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" /> {/* Add favicon here */}
      </Head>
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
        bgcolor="lightgray"
      >
        {/* Logo and Title */}
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            component="img"
            src="logo.png"
            alt="Logo"
            width={50}
            height={50}
            marginRight={1}
            borderRadius="10%"
          />
          <Typography variant="h4">PlanMyTrip</Typography>
        </Box>
        <Stack
          direction="column"
          width="80%"
          height="70%"
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
                alignItems="center"
              >
                {/* TripGenie Picture */}
                {msg.role === "assistant" && (
                  <Box
                    component="img"
                    src="genie.png"
                    alt="Assistant"
                    width={40}
                    height={40}
                    borderRadius="10%"
                    marginRight={1}
                  />
                )}
                <Box
                  bgcolor={
                    msg.role === "assistant" ? "primary.main" : "secondary.main"
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>{" "}
                  {/* Render markdown content */}
                </Box>

                {/* User Picture */}
                {msg.role === "user" && (
                  <Box
                    component="img"
                    src="profile-pic.png"
                    alt="User"
                    width={40}
                    height={40}
                    borderRadius="10%"
                    marginLeft={1}
                  />
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ position: "relative", bottom: 0, left: 0, right: 0 }}
          >
            <TextField
              label="Type your message here..."
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent the default action (like a new line)
                  sendMessage();
                }
              }}
            />
            <Button variant="contained" onClick={sendMessage}>
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
