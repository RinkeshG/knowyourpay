// /api/analyze.js — Vercel Serverless Function
// Prompt logic lives server-side. Frontend sends structured data, backend builds prompt.
// Deploy: place in /api/analyze.js in your Vercel project root.
// Env var needed: ANTHROPIC_API_KEY (set in Vercel dashboard → Settings → Environment Variables)

export default async function handler(req, res) {
  // (Optional but helpful) handle preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    // Ensure body is an object (covers some edge cases)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    const {
      currentRole, targetRole, level, experience,
      industries, stages, targetCompany,
      country, city, salaryRange, bonus, esops,
      expectedRange, competing, notice, currency
    } = body;

    // Validate required fields
    if (
      !currentRole ||
      !targetRole ||
      !experience ||
      !industries?.length ||
      !salaryRange ||
      !expectedRange ||
      !targetCompany
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate against known allow-lists (anti-gaming)
    const ALLOWED_CURRENCIES = ["INR", "USD", "GBP"];
    const cur = ALLOWED_CURRENCIES.includes(currency) ? currency : "INR";

    const prompt = `You are a salary negotiation expert for the ${country || "Indian"} tech market. Return ONLY valid JSON. No markdown, no backticks.

CANDIDATE:
- Current: ${currentRole} (${level || "not specified"})
- Target: ${targetRole}
- Experience: ${experience}
- Industries: ${industries.join(", ")}
- Company stages: ${stages?.join(", ") || "not specified"}
- Target company: ${targetCompany}
- Location: ${city ? city + ", " : ""}${country || ""}
- Current salary range: ${salaryRange}
- Bonus: ${bonus || "none"}, ESOPs: ${esops || "none"}
- Expected range: ${expectedRange}
- Competing offers: ${competing || "no"}
- Notice: ${notice || "standard"}

Return this exact JSON structure:
{
  "situation": {
    "standing": "underpaid|fair|well-paid|overpaid",
    "headline": "sentence with **bold emphasis**",
    "summary": "2 plain-language sentences. Never say percentile/p25/p50.",
    "marketRange": {"p25": INT, "p50": INT, "p75": INT, "p90": INT},
    "percentile": 35,
    "percentileText": "Plain language: Most people in your role earn more than you"
  },
  "opportunity": {
    "quality": "poor|decent|good|excellent",
    "jumpPct": 40,
    "avgJump": 25,
    "targetRange": {"p25": INT, "p50": INT, "p75": INT, "p90": INT},
    "askFeedback": "sentence",
    "askLevel": "low|right|high",
    "insight": "2 sentences with **bold**"
  },
  "gameplan": {
    "askFor": INT,
    "settleAt": INT,
    "dontGoBelow": INT,
    "whyThisNumber": "sentence",
    "tactics": [
      {"title": "name", "when": "timing", "script": "exact words to say", "why": "reason"},
      {"title": "name", "when": "timing", "script": "words", "why": "reason"},
      {"title": "name", "when": "timing", "script": "words", "why": "reason"},
      {"title": "name", "when": "timing", "script": "words", "why": "reason"}
    ],
    "watchOut": ["flag", "flag"],
    "bonusLevers": [
      {"what": "lever", "ask": "specific ask"},
      {"what": "lever", "ask": "ask"},
      {"what": "lever", "ask": "ask"}
    ],
    "hypeAdjusted": {"low": INT, "high": INT},
    "emailDraft": "3 sentence counter-offer email",
    "timeline": [
      {"day": "Week 1", "action": "action"},
      {"day": "Week 2-3", "action": "action"},
      {"day": "Week 4", "action": "action"}
    ]
  },
  "confidence": {"score": 72, "note": "caveat"}
}

IMPORTANT: All salary values as raw integers in ${cur}. Use PLAIN LANGUAGE — never say percentile, p25, p50, p75, p90. Say "most people", "top earners", "lower end", "average" etc.`;

    // ✅ IMPORTANT FIX: call Anthropic directly from the SERVER (not /api/analyze)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Keeping your model exactly as you requested:
        model: "claude-sonnet-4-6",
        max_tokens: 2800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Anthropic API error:", response.status, errText);
      return res.status(502).json({
        error: "Analysis service unavailable",
        status: response.status,
        // keep it short so you can see the reason in Vercel logs
        details: errText?.slice?.(0, 600) || "Unknown error",
      });
    }

    const data = await response.json();

    const raw = (data.content || []).map((c) => c.text || "").join("");
    const clean = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);

    if (!match) {
      console.error("Invalid model output (no JSON object found):", clean.slice(0, 600));
      return res.status(502).json({ error: "Invalid response from analysis" });
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error("JSON parse failed:", e, match[0].slice(0, 600));
      return res.status(502).json({ error: "Invalid JSON from analysis" });
    }

    if (!parsed.situation || !parsed.gameplan) {
      return res.status(502).json({ error: "Incomplete analysis" });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: "Analysis failed" });
  }
}
