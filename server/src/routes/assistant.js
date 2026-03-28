import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSampleEventsWithDates } from "../data/sampleEvents.js";

const router = Router();

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function buildCatalogPayload() {
  const events = getSampleEventsWithDates();
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

  const catalog = buildCatalogPayload();
  const catalogJson = JSON.stringify(catalog);

  const instructions = `You are the Event Finder assistant. Users only have the events in the CATALOG JSON (demo/sample data).

RULES:
1. If the user's message is about events, concerts, festivals, venues, tickets, cities, dates, categories, recommendations, schedules, or anything clearly about finding or discussing these catalog events — set "eventRelated": true. Answer using ONLY the catalog. Mention event names, cities, categories, and dates when helpful. If nothing matches, say the catalog has no matching event and suggest broadening the question.
2. For ANY question not about events or this catalog (e.g. programming, homework, unrelated trivia, personal advice unrelated to events) — set "eventRelated": false and set "reply" to exactly this sentence and nothing else: "This query is not related to events. Please ask about concerts, festivals, venues, or our demo events."
3. Output ONLY valid minified JSON on a single line or plain JSON object with this exact shape (no markdown code fences):
{"eventRelated":true or false,"reply":"your answer string"}

CATALOG (${catalog.length} events):
${catalogJson}

USER MESSAGE:
${message}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: instructions }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });
    let text = result.response.text().trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Could not parse AI response",
        eventRelated: false,
        reply:
          "The assistant returned an unexpected format. Please try again with a shorter question about events.",
      });
    }

    const eventRelated = Boolean(parsed.eventRelated);
    const reply =
      typeof parsed.reply === "string"
        ? parsed.reply
        : "This query is not related to events. Please ask about concerts, festivals, venues, or our demo events.";

    const notRelatedMsg =
      "This query is not related to events. Please ask about concerts, festivals, venues, or our demo events.";

    if (!eventRelated) {
      return res.json({ eventRelated: false, reply: notRelatedMsg });
    }

    return res.json({ eventRelated: true, reply });
  } catch (e) {
    console.error("Gemini error:", e);
    return res.status(500).json({
      error: e.message || "AI request failed",
      eventRelated: false,
    });
  }
});

export default router;
