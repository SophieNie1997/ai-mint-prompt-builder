import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { buildImageApiRequest, extractImageDataUrl } from "./image-generation.js";

const appDir = fileURLToPath(new URL(".", import.meta.url));
const startPort = Number(process.env.PORT || 8787);
const defaultBaseUrl = "https://api.kksj.org/v1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 120_000) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function handleGenerateImage(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "POST required." });
    return;
  }

  const apiKey = process.env.KKSJ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendJson(res, 400, {
      error: "KKSJ_API_KEY or OPENAI_API_KEY is not set. Start the local server with a valid image API key.",
    });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const { url, body } = buildImageApiRequest(payload.prompt, {
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
      sendJson(res, response.status, {
        error: data?.error?.message || "Image generation failed.",
      });
      return;
    }

    sendJson(res, 200, {
      imageDataUrl: extractImageDataUrl(data),
      model: body.model,
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Image generation failed." });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  const rawPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const safePath = normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(appDir, safePath);

  if (!filePath.startsWith(appDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const bytes = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
    });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

function makeServer() {
  return createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/api/generate-image") {
      handleGenerateImage(req, res);
      return;
    }
    serveStatic(req, res);
  });
}

function listen(port) {
  const server = makeServer();
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && port < startPort + 20) {
      listen(port + 1);
      return;
    }
    throw error;
  });
  server.listen(port, () => {
    console.log(`AI Mint Prompt Builder running at http://localhost:${port}`);
  });
}

listen(startPort);
