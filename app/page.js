"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import Head from "next/head";
import ReactMarkdown from "react-markdown";

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
    if (!message.trim()) return;

    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        partialResponse += chunk;

        // Update the last message with the accumulated response
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].content = partialResponse;
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <Head>
        <title>PlanMyTrip Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container
        maxWidth="md"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src="logo.png"
              alt="Logo"
              sx={{ width: 40, height: 40, mr: 2, borderRadius: "10%" }}
            />
            <Typography variant="h5" component="h1">
              PlanMyTrip
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
            <Stack spacing={2}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "assistant" ? "flex-start" : "flex-end",
                    mb: 2,
                  }}
                >
                  {msg.role === "assistant" && (
                    <Box
                      component="img"
                      src="genie.png"
                      alt="Assistant"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        mr: 1,
                        alignSelf: "flex-start",
                      }}
                    />
                  )}
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      bgcolor:
                        msg.role === "assistant"
                          ? "primary.light"
                          : "secondary.light",
                      borderRadius:
                        msg.role === "assistant"
                          ? "20px 20px 20px 5px"
                          : "20px 20px 5px 20px",
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <Typography variant="body1" gutterBottom {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <Typography variant="h5" gutterBottom {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <Typography variant="h6" gutterBottom {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            style={{ paddingLeft: 20, marginBottom: 16 }}
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            style={{ paddingLeft: 20, marginBottom: 16 }}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{ marginBottom: 8 }} {...props} />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline ? (
                            <code
                              style={{
                                backgroundColor: "#f0f0f0",
                                padding: "2px 4px",
                                borderRadius: 4,
                              }}
                              {...props}
                            />
                          ) : (
                            <Box
                              component="pre"
                              sx={{
                                backgroundColor: "#f0f0f0",
                                p: 2,
                                borderRadius: 1,
                                overflowX: "auto",
                              }}
                            >
                              <code {...props} />
                            </Box>
                          ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </Paper>
                  {msg.role === "user" && (
                    <Box
                      component="img"
                      src="profile-pic.png"
                      alt="User"
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        ml: 1,
                        alignSelf: "flex-start",
                      }}
                    />
                  )}
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  InputProps={{ sx: { borderRadius: "20px" } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: "20px", px: 3 }}
                >
                  Send
                </Button>
              </Stack>
            </form>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
