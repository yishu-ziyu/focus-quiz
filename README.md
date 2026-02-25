# Focus Quiz (Optimized)

Chrome extension that generates high-pressure comprehension quizzes from selected text.

## Provider support

- Google Gemini
- OpenAI
- Anthropic
- DeepSeek / Zhipu / MiniMax / Qwen (OpenAI-compatible)
- Ollama (local)

## Development log workflow

This project keeps a running development log in `DEVELOPMENT_LOG.md`.

- Auto append on each commit: `.githooks/post-commit`
- Manual snapshot: `./scripts/devlog_sync.sh`

Hook setup (already configured in this repo):

```bash
git config --local core.hooksPath .githooks
```

## Local Ollama note

If `localhost:11434` returns `403` from browser extension requests, run an Ollama service with allowed origins and point the extension endpoint to that host/port.
