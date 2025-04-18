"use client";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are Tribe, an AI travel assistant designed to help users effortlessly plan and prepare for their trips.
Your role is to provide personalized itinerary suggestions, offer packing and preparation tips, and assist with important travel logistics like booking accommodations, arranging transportation, and ensuring essential documents are in order.
Your goal is to make travel planning stress-free, ensuring users are fully prepared and can focus on enjoying their journey.
Adapt your recommendations to the user's specific travel needs and preferences, while maintaining a friendly and supportive tone.
Always identify yourself as Tribe and maintain a helpful, friendly demeanor.`;

const INITIAL_MESSAGE = {
  role: "user",
  content: "Hi! Can you help me plan my trip?",
};

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi! I'm Tribe, your AI travel companion. I'm here to help make your travel planning easy and enjoyable. Whether you need help with itineraries, packing lists, finding accommodations, or travel tips, I've got you covered. How can I assist with your travel plans today?",
};

export default function ChatPage() {
  const theme = useTheme();
  const [messages, setMessages] = useState([INITIAL_MESSAGE, WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationWithPrompt = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
        userMessage
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationWithPrompt }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ height: "100vh", py: 3 }}>
      <Paper
        elevation={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          bgcolor: "grey.50",
          borderRadius: 4,
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: "divider",
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
              PlanMyTrip
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Your AI Travel Companion
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: "auto", 
            p: 3,
            background: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8))',
            opacity: 1,
          }}
        >
          <Stack spacing={2}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                  gap: 1,
                  opacity: 0,
                  animation: "fadeIn 0.5s ease-out forwards",
                  "@keyframes fadeIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                {msg.role === "assistant" && (
                  <Avatar
                    src="/tribe-avatar.png"
                    alt="Tribe"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    T
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: "70%",
                    backgroundColor:
                      msg.role === "user" 
                        ? `${theme.palette.primary.main}` 
                        : "white",
                    color: msg.role === "user" ? "white" : "text.primary",
                    borderRadius: msg.role === "user" ? "20px 20px 5px 20px" : "20px 20px 20px 5px",
                    boxShadow: 3,
                    transition: "all 0.3s ease-in-out",
                    '&:hover': {
                      transform: 'scale(1.01)',
                    },
                  }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <Typography 
                          variant="body1" 
                          gutterBottom 
                          sx={{ 
                            lineHeight: 1.7,
                            '& code': {
                              backgroundColor: msg.role === "user" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              fontSize: "0.9em",
                            },
                          }}
                          {...props} 
                        />
                      ),
                      a: ({ node, ...props }) => (
                        <a 
                          style={{ 
                            color: msg.role === "user" ? "white" : theme.palette.primary.main,
                            textDecoration: "underline",
                          }} 
                          {...props} 
                        />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </Paper>
                {msg.role === "user" && (
                  <Avatar
                    src="/profile-pic.png"
                    alt="User"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.secondary.main,
                    }}
                  >
                    U
                  </Avatar>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Input */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: "divider",
            bgcolor: "white",
            boxShadow: "0px -4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask Tribe about your travel plans..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                inputRef={inputRef}
                multiline
                maxRows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "grey.50",
                    '&:hover': {
                      backgroundColor: "grey.100",
                    },
                    '& fieldset': {
                      borderColor: "grey.200",
                    },
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <IconButton
                type="submit"
                disabled={isLoading || !input.trim()}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  '&.Mui-disabled': {
                    bgcolor: "grey.300",
                    color: "grey.500",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}
