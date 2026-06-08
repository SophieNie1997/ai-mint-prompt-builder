const DEFAULT_IMAGE_BASE_URL = "https://api.kksj.org/v1";
const DEFAULT_IMAGE_MODEL = "dall-e-3";
const DEFAULT_IMAGE_SIZE = "1024x1024";
const DEFAULT_IMAGE_QUALITY = "standard";
const DEFAULT_RESPONSE_FORMAT = "b64_json";

function imageEndpointFrom(baseUrl = DEFAULT_IMAGE_BASE_URL) {
  return `${String(baseUrl).replace(/\/+$/, "")}/images/generations`;
}

export function buildImageApiRequest(prompt, options = {}) {
  const cleanPrompt = String(prompt || "").trim();
  if (!cleanPrompt) throw new Error("Prompt is required.");

  return {
    url: imageEndpointFrom(options.baseUrl),
    body: {
      model: options.model || DEFAULT_IMAGE_MODEL,
      prompt: cleanPrompt,
      size: options.size || DEFAULT_IMAGE_SIZE,
      quality: options.quality || DEFAULT_IMAGE_QUALITY,
      response_format: options.responseFormat || DEFAULT_RESPONSE_FORMAT,
      n: 1,
    },
  };
}

export function extractImageDataUrl(response) {
  const image = response?.data?.[0];
  if (!image) throw new Error("No image returned.");

  if (image.b64_json) {
    const format = response.output_format || "png";
    return `data:image/${format};base64,${image.b64_json}`;
  }

  if (image.url) return image.url;

  throw new Error("Image response did not include b64_json or url.");
}

export function createImageVersion({ number, prompt, labels, image }) {
  return {
    number,
    prompt,
    labels: { ...labels },
    image,
    source: "generated",
  };
}
