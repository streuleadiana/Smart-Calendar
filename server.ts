import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/magic-notes", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
        return res.status(400).json({ error: "Gemini API key is missing or not configured." });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { content } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please format this messy note into a beautiful, organized list with emojis, and fix any typos. Keep it in Romanian. Note content: \n\n${content}`
      });
      
      res.json({ text: response.text });
    } catch (err: any) {
      if (err.message && err.message.includes("API key not valid")) {
          return res.status(400).json({ error: "Cheia API Gemini nu este validă. Te rog să o configurezi corect." });
      }
      res.status(500).json({ error: err.message || "Failed to process text" });
    }
  });

  app.post("/api/mood-recap", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
        return res.status(400).json({ error: "Gemini API key is missing or not configured." });
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { logs } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please act as an empathetic, encouraging personal assistant for the 'SmartPlanner' app. Read the user's mood logs for this month and write a short, sweet, and comforting summary of their emotional month. Keep it in Romanian, use soft emojis, and act like a supportive friend.\n\nLogs:\n${logs}`
      });
      
      res.json({ text: response.text });
    } catch (err: any) {
      if (err.message && err.message.includes("API key not valid")) {
          return res.status(400).json({ error: "Cheia API Gemini nu este validă. Te rog să o configurezi corect." });
      }
      res.status(500).json({ error: err.message || "Failed to generate recap" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 5
    app.get("(.*)", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
