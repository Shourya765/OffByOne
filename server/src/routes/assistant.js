import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCatalogEventsWithDates } from "../services/catalogEvents.js";

const router = Router();

// Note: Ensure your .env uses a valid model name like 'gemini-1.5-flash'
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function buildCatalogPayload() {
  try {
    const events = await getCatalogEventsWithDates();
    return events.map((e) => ({
      id: e.id,
      name: e.name,
      city: e.city,
      country: e.countryCode,
      category: e.category,
      startDate: e.startDate,
      venue: e.venue,
      priceRange: e.priceRange,
      description: (e.description || "").slice(0, 220),
    }));
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return [];
  }
}

router.post("/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim().slice(0, 4000);
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.status(503).json({
      error: "AI assistant is not configured. Set GEMINI_API_KEY in server/.env",
      eventRelated: false,
    });
  }

  const catalog = await buildCatalogPayload();
  const catalogJson = JSON.stringify(catalog);

  // Clearer instructions for the AI
  const instructions = `You are the Event Finder assistant. 
Users only have access to events in the CATALOG JSON provided below.

RULES:
1. If the user's message is about events, concerts, festivals, venues, tickets, cities, dates, or recommendations — set "eventRelated": true. Use the CATALOG to answer.
2. If the question is UNRELATED to the catalog (programming, homework, general trivia) — set "eventRelated": false and set "reply" to exactly: "This query is not related to events. Please ask about concerts, festivals, venues, or our demo events."
3. Output ONLY a valid JSON object.

CATALOG (${catalog.length} events):
${catalogJson}

USER MESSAGE:
${message}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // 'application/json' forces the model to return valid JSON without markdown code fences
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(instructions);
    const text = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", text);
      return res.status(502).json({
        error: "Could not parse AI response",
        eventRelated: false,
        reply: "The assistant returned an unexpected format. Please try again with a shorter question.",
      });
    }

    const eventRelated = Boolean(parsed.eventRelated);
    const notRelatedMsg = "This query is not related to events. Please ask about concerts, festivals, venues, or our demo events.";
    
    // Final safety check on the reply content
    const reply = eventRelated ? (parsed.reply || notRelatedMsg) : notRelatedMsg;

    return res.json({ 
      eventRelated, 
      reply 
    });

  } catch (e) {
    console.error("Gemini error:", e);
    const status = e?.status === 400 || e?.status === 403 ? e.status : 500;
    return res.status(status).json({
      error: e.message || "AI request failed",
      eventRelated: false,
    });
  }
});

export default router;