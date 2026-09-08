const express = require("express");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname));

const groq = process.env.GROQ_API_KEY
    ? new Groq({
          apiKey: process.env.GROQ_API_KEY
      })
    : null;

console.log(
    groq
        ? "✅ FOCLYRA AI: Groq connected!"
        : "❌ FOCLYRA AI: Groq API key missing!"
);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        aiConnected: !!groq
    });
});

// AI chat
app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body?.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        if (!groq) {
            return res.status(500).json({
                error: "Groq API key is missing."
            });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are FOCLYRA AI, a friendly study assistant. Explain academic topics simply, clearly, and with examples when useful."
                },
                {
                    role: "user",
                    content: message
                }
            ],
           model: "openai/gpt-oss-20b"
        });

        const answer =
            completion.choices?.[0]?.message?.content ||
            "Sorry, I couldn't generate a response.";

        res.json({
            reply: answer
        });

    } catch (error) {
        console.error("❌ GROQ ERROR:", error);

        res.status(500).json({
            error: error.message || "AI request failed."
        });
    }
});

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("🚀 FOCLYRA SERVER RUNNING");
    console.log(`🌐 http://localhost:${PORT}`);
    console.log("--------------------------------");
});