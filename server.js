// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Translator server is running"));

app.post("/translate", async (req, res) => {
  try {
    const { text, target } = req.body || {};
    if (!text) return res.status(400).json({ error: "no text provided" });

    const system = "You are a translation engine. Only return the translation.";
    const lang = target === "ru" ? "Russian" : "English";
    const user = `Translate to ${lang}: """${text}"""`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    const data = await r.json();
    const translated =
      data?.output?.[0]?.content?.[0]?.text ??
      data?.output_text ??
      "";

    res.json({ translated });
  } catch (err) {
    res.status(500).json({ error: "server_error", detail: String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server running on port", port));
