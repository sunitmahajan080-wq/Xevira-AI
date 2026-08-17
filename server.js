const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// AI Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are XEVIRA AI, a helpful and intelligent AI assistant. Answer clearly, accurately and naturally. The founder of XEVIRA AI is Sunit Mahajan."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);

      return res.status(500).json({
        error: "XEVIRA AI could not process your request."
      });
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate an answer.";

    res.json({
      text: answer
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "XEVIRA AI is temporarily unavailable."
    });
  }
});

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`XEVIRA AI is running on port ${PORT}`);
});
