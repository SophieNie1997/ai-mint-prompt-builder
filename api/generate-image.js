import { buildImageApiRequest, extractImageDataUrl } from "../lib/image-generation.js";

const defaultBaseUrl = "https://api.kksj.org/v1";

function send(res, status, payload) {
  res.status(status).json(payload);
}

function readPrompt(body) {
  if (typeof body === "string") {
    try {
      return JSON.parse(body).prompt;
    } catch {
      return "";
    }
  }
  return body?.prompt;
}

export default async function handler(req, res) {
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    send(res, 405, { error: "POST required." });
    return;
  }

  const apiKey = process.env.KKSJ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    send(res, 400, {
      error: "KKSJ_API_KEY is not set. Add it as a Vercel Environment Variable.",
    });
    return;
  }

  try {
    const { url, body } = buildImageApiRequest(readPrompt(req.body), {
      baseUrl: process.env.AI_IMAGE_BASE_URL || process.env.OPENAI_BASE_URL || defaultBaseUrl,
      model: process.env.IMAGE_MODEL,
      size: process.env.IMAGE_SIZE,
      quality: process.env.IMAGE_QUALITY,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      send(res, response.status, {
        error: data?.error?.message || "Image generation failed.",
      });
      return;
    }

    send(res, 200, {
      imageDataUrl: extractImageDataUrl(data),
      model: body.model,
    });
  } catch (error) {
    send(res, 400, { error: error.message || "Image generation failed." });
  }
}
