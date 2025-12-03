import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" })); // supaya gambar besar bisa masuk

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/ask", async (req, res) => {
  try {
    const { message, image } = req.body;

    console.log("User message:", message);
    console.log("User image:", image ? "Ada gambar" : "Tidak ada gambar");

    // bangun input parts
    const parts = [];

    if (message) parts.push({ text: message });

    if (image) {
      // image = "data:image/png;base64,....."
      const base64 = image.split(",")[1];
      const mime = image.match(/data:(.*?);/)[1];

      parts.push({
        inlineData: {
          mimeType: mime,
          data: base64,
        },
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    const reply =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Maaf, tidak ada jawaban.";

    res.json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
