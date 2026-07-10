import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Cloud save persistence file path
const CLOUD_SAVES_FILE = path.join("/tmp", "lune_cloud_saves.json");
// Luneville board posts persistence file path
const LUNEVILLE_POSTS_FILE = path.join("/tmp", "luneville_posts.json");

// Helper to load saves from disk
function loadSavesFromDisk(): Record<string, any> {
  try {
    if (fs.existsSync(CLOUD_SAVES_FILE)) {
      const data = fs.readFileSync(CLOUD_SAVES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read saves from disk:", err);
  }
  return {};
}

// Helper to save saves to disk
function saveSavesToDisk(saves: Record<string, any>) {
  try {
    fs.writeFileSync(CLOUD_SAVES_FILE, JSON.stringify(saves), "utf-8");
  } catch (err) {
    console.error("Failed to write saves to disk:", err);
  }
}

// Helper to load posts from disk
function loadPostsFromDisk(): any[] {
  try {
    if (fs.existsSync(LUNEVILLE_POSTS_FILE)) {
      const data = fs.readFileSync(LUNEVILLE_POSTS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to read posts from disk:", err);
  }
  return [];
}

// Helper to save posts to disk
function savePostsToDisk(posts: any[]) {
  try {
    fs.writeFileSync(LUNEVILLE_POSTS_FILE, JSON.stringify(posts), "utf-8");
  } catch (err) {
    console.error("Failed to write posts to disk:", err);
  }
}

// Initialize Gemini client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads for POST API routes
  app.use(express.json());

  // Serve static assets from the root assets directory
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

  // Luneville Board Posts endpoints
  app.get("/api/board/posts", (req, res) => {
    try {
      const posts = loadPostsFromDisk();
      if (posts.length === 0) {
        // Return 404 so that the client knows it should seed (or we can return an empty array or handle seeding on client)
        return res.status(404).json({ error: "No posts found" });
      }
      return res.json(posts);
    } catch (err: any) {
      console.error("Failed to fetch posts:", err);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/board/posts", (req, res) => {
    try {
      const posts = req.body;
      if (!Array.isArray(posts)) {
        return res.status(400).json({ error: "Invalid posts format, expected an array" });
      }
      savePostsToDisk(posts);
      console.log(`[Luneville Board] Successfully saved ${posts.length} posts.`);
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to save posts:", err);
      return res.status(500).json({ error: "Failed to save posts" });
    }
  });

  // Cloud Save System endpoints
  app.post("/api/saves/create", (req, res) => {
    try {
      const { data, code: requestedCode } = req.body;
      if (!data) {
        return res.status(400).json({ error: "No data payload provided" });
      }

      const saves = loadSavesFromDisk();
      let code = "";

      if (requestedCode && typeof requestedCode === 'string') {
        code = requestedCode.trim().toUpperCase();
      } else {
        // Generate a clean, simple, memorizable 6-character uppercase save code
        // Format: LUNE + 4-digit number + 2 letters
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing characters like O, I, 1, 0
        do {
          let suffix = "";
          for (let i = 0; i < 2; i++) {
            suffix += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit number
          code = `LUNE-${randomNum}${suffix}`;
        } while (saves[code]); // Ensure uniqueness
      }

      saves[code] = {
        data,
        createdAt: new Date().toISOString()
      };

      saveSavesToDisk(saves);
      console.log(`[Cloud Save] Created/Updated save code: ${code}`);

      return res.json({ success: true, code });
    } catch (err: any) {
      console.error("Failed to create cloud save:", err);
      return res.status(500).json({ error: err.message || "Failed to create cloud save" });
    }
  });

  app.all("/api/saves/load", (req, res) => {
    try {
      // Handle both POST body and GET query parameter
      const code = (req.method === 'POST' ? req.body?.code : req.query?.code);
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "Save code is required" });
      }

      const normalizedCode = code.trim().toUpperCase();
      const saves = loadSavesFromDisk();
      const save = saves[normalizedCode];

      if (!save) {
        return res.status(404).json({ error: "Save code not found or expired" });
      }

      console.log(`[Cloud Save] Loaded save code: ${normalizedCode}`);
      return res.json({ success: true, data: save.data });
    } catch (err: any) {
      console.error("Failed to load cloud save:", err);
      return res.status(500).json({ error: err.message || "Failed to load cloud save" });
    }
  });

  // &TEAM AI Assistant endpoint powered by Gemini with Search Grounding
  app.post("/api/andteam-ai", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const systemInstruction = `You are LUNA, the official &TEAM AI Fandom Assistant in the LUNÉ Fun Hub.
Your purpose is to answer questions, share fun facts, and discuss &TEAM (HYBE LABELS JAPAN's 9-member global group: EJ, Fuma, K, Nicholas, Yuma, Jo, Taki, Harua, Maki) and their fandom LUNÉ.
Be enthusiastic, friendly, welcoming, and use cute wolf and moon emojis (🐺, 🌕, 🌙, 🐾) often!
Always be respectful, positive, and deeply knowledgeable. Ground your knowledge in official &TEAM profiles, songs, and lore (DARK MOON: THE GREY CITY).
If the user asks questions about recent news, comebacks, active schedules, or dynamic concert tours, use the Google Search tool to find accurate and up-to-date information.`;

      // Construct contents format for GoogleGenAI SDK
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "I couldn't generate a response. Please try again!";
      
      // Extract grounding metadata chunks for source linking
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks ? chunks.map((c: any) => ({
        title: c.web?.title || "Web Search Source",
        uri: c.web?.uri
      })).filter((s: any) => s.uri) : [];

      return res.json({ text, sources });
    } catch (err: any) {
      console.error("Gemini API endpoint error:", err);
      const errMsg = err.message || "";
      const isQuota = errMsg.includes("RESOURCE_EXHAUSTED") || 
                      errMsg.includes("429") || 
                      errMsg.includes("quota") || 
                      err.status === 429 ||
                      err.code === 429;
                      
      if (isQuota) {
        return res.json({
          text: "🌙 Oh no! LUNA is experiencing a temporarily weak lunar signal (Gemini API Quota Exhausted / 429 Rate Limit).\n\nTo restore full celestial connection and continue chatting, please configure a valid Gemini API Key in the **Settings > Secrets** panel of AI Studio, or check your Google AI Studio plan and billing details! 🐺🐾",
          sources: []
        });
      }
      return res.status(500).json({ error: err.message || "Failed to contact Gemini AI" });
    }
  });

  // Spotify preview proxy

  // Spotify preview proxy
  app.get("/api/spotify-preview/:trackId", async (req, res) => {
    try {
      const { trackId } = req.params;
      const url = `https://open.spotify.com/embed/track/${trackId}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch Spotify track" });
      }
      const html = await response.text();
      const match = html.match(/https:\/\/p\.scdn\.co\/mp3-preview\/[a-f0-9]+/);
      if (match) {
        return res.json({ previewUrl: match[0] });
      }
      return res.status(404).json({ error: "Preview URL not found in Spotify page" });
    } catch (err: any) {
      console.error("Spotify proxy error:", err);
      return res.status(500).json({ error: err.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
