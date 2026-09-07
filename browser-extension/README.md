# Export AI to Word (md-to-docx)

Chrome extension (Manifest V3) to export AI chats as professional Word DOCX. Optional webpage export can be enabled in Options (requests broader host access).

Conversion runs on your **local** md-to-docx Playground — not on a cloud service. The convert endpoint must be **loopback** (`127.0.0.1` / `localhost`). When Playground is offline, buttons show **Export MD** and download Markdown instead.

## Features (v0.2.4)

- **Full conversation export** on supported AI sites (user + assistant turns)
- **Batch export** on ChatGPT / Claude / Doubao: left-bottom circular **B** launcher → **Select chats** → one combined file
- **Floating button** on AI sites (**on by default**; drag to move)
- **Optional webpage export**: enable in Options (Chrome will ask for all-sites access)
- Offline-aware labels: **Export to Word** vs **Export MD**

## Where the button appears

### AI chat sites (message toolbar + floating + batch where supported)

| Site | URL pattern | Batch select |
|------|-------------|--------------|
| ChatGPT | `https://chatgpt.com/*` | Yes |
| Claude | `https://claude.ai/*` | Yes |
| Gemini | `https://gemini.google.com/*` | — |
| DeepSeek | `https://chat.deepseek.com/*` | — |
| Kimi | `https://kimi.moonshot.cn/*`, `https://www.kimi.com/*` | — |
| Doubao (豆包) | `https://www.doubao.com/*` | Yes |

### Floating button on arbitrary webpages

Off by default. Options → **Enable webpage export on all sites** → Save (accept the permission prompt) → refresh tabs.

### Does NOT work

- Cursor / VS Code **embedded** AI chat panels
- `chrome://` and other non-http(s) pages
- The local Playground page itself is excluded from the webpage script

## Setup

### 1. Start the Playground

```bash
docker compose -f web/docker-compose.yml up --build
```

Default endpoint: `http://127.0.0.1:8080`

### 2. Load the extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `browser-extension/` folder

### 3. Options

Click extension → Options (or open `src/options.html`):

- **Endpoint URL** — must be loopback (`127.0.0.1` / `localhost`)
- **Preset** — default `technical`
- **Fallback .md** — download markdown if convert fails / offline
- **Show floating button** — on AI chat pages
- **Enable webpage export** — optional; requests all-sites host access

## Usage

1. Start the Playground (optional; offline → MD)
2. Open a supported AI site in Chrome
3. **Current chat:** click **Export to Word** / **Export MD** on the last reply → exports the **full** open conversation
4. **Batch:** click the left-bottom circular **B** button → **Select chats** → tick items (scroll the site sidebar first if empty, then **Refresh list**) → **Export (N)** → one combined document
5. **Webpage (if enabled):** click the circular launcher → **Export to Word** / **Export MD** in the sheet (or select text first)

After installing or updating the extension, **refresh** open tabs. Reloading the extension without refreshing leaves a dead content script that cannot call `chrome.storage`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Button says Export MD | Playground not reachable at the endpoint — start Docker or fix Options URL (must be loopback) |
| Toast: *Could not find conversation content on this page* | Open a chat that already has messages, refresh after reloading the extension |
| No floating button on AI sites | Options → enable *Show floating button*, Save, refresh |
| No floating button on other sites | Options → enable *webpage export*, accept permission, refresh |
| Floating is only a circle | Click the launcher to open the export sheet |
| Doubao: no toolbar button | Enable floating button as fallback; refresh after update |
| Batch missing threads | Open left **B** → **Select chats**, scroll the site sidebar, then **Refresh list** |
| Batch skipped stale chat | Wait for the chat to finish loading, then retry; SPA may still show the previous conversation briefly |
| Using Cursor side panel | Switch to a Chrome tab |
| Extension just installed | Refresh the page |
| Extension context invalidated | Reload the extension, then **refresh open tabs** |

## Privacy

Content is sent only to a **loopback** endpoint you configure. Non-local endpoints are rejected. No third-party conversion API. Webpage export is opt-in and requires an extra Chrome permission.

## Attribution

HTML → Markdown uses [Turndown](https://github.com/mixmark-io/turndown) (MIT), vendored under `vendor/turndown/` with its LICENSE. Run `npm install` (or `npm run vendor:turndown`) to refresh the copy from the npm package.

## Tests

```bash
cd browser-extension
npm install
npm test
```

Uses jsdom + HTML fixtures in `testdata/`. Site DOM changes may break adapters — update selectors in `src/content/`.

## Icons

Regenerate from repo root: `python scripts/generate_extension_icons.py`

## Demo narrative

Open Claude → ask for a report → **Export to Word** → open `document.docx` in Word. Or click left **B** → **Select chats** → tick several → **Export**.
