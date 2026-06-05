# AI Mint Studio Prompt Builder

Classroom prompt builder for Lumi Lesson 6. Students choose prompt blocks, build an English image prompt, generate an island currency image, and compare prompt/image versions.

## Local Classroom Mode

```bash
KKSJ_API_KEY=your_key_here node server.mjs
```

Open `http://localhost:8787`.

## Vercel Deployment

This project is ready for Vercel:

- Static files are served from the project root.
- `api/generate-image.js` is the server-side image endpoint.
- The API key must be stored in Vercel Environment Variables, not in GitHub.

Required environment variable:

```text
KKSJ_API_KEY=your_kksj_key
```

Optional environment variables:

```text
AI_IMAGE_BASE_URL=https://api.kksj.org/v1
IMAGE_MODEL=dall-e-3
IMAGE_QUALITY=standard
IMAGE_SIZE=1024x1024
```

## Safety Notes

- Do not commit API keys.
- If students or parents will use the shared URL, add a usage budget or rotate the key regularly.
- The browser stores comparison cards in localStorage on each device.
