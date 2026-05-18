# AI Providers

This app uses a server-side provider layer so frontend routes do not change when models/providers change.

## Default provider usage

- **AI Coach chat**: Groq (default)
- **Credit Report Scanner**: Gemini (default, better for long report text extraction)
- **Fallback**: OpenRouter (if configured and primary provider is not configured)

## Environment variables

- `AI_PROVIDER` global default provider
- `AI_CHAT_PROVIDER` chat-specific provider
- `AI_CREDIT_SCAN_PROVIDER` credit-scan-specific provider
- `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-2.5-flash`)
- `GROQ_API_KEY`, `GROQ_MODEL` (default `llama-3.3-70b-versatile`)
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` (default `openrouter/free`)
- `OPENAI_API_KEY` (still supported for compatibility)

## Notes

- API keys are never sent to frontend clients.
- Free tiers (Gemini/Groq/OpenRouter free models) can be rate-limited and are not guaranteed for production SLAs.
- OpenAI/Claude can be switched in later by updating env provider selection, without frontend rewrites.
