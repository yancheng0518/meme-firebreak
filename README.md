# Meme Firebreak

> Put the joke in context before the context catches fire.

Meme Firebreak is a local-first Chinese meme and slang context tool. Paste a sentence, choose the audience, and it produces a shareable context card with:

- a plain-language rewrite
- detected high-context phrases and what they imply
- a heat score for how meme-heavy the sentence is
- audience-specific misunderstanding risk for family chats, work chats, and public posts
- local recent history, Markdown copy, and Markdown export

It was inspired by the current Chinese discussion around overused internet catchphrases. It is not a trend scraper and sends no text to a server.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verify

```bash
npm run lint
npm run test
npm run build
```

## Use

1. Enter a sentence with a meme phrase or high-context internet expression.
2. Pick the intended audience.
3. Choose **Generate context card**.
4. Copy the card for a chat, or export it as Markdown.

The built-in lexicon is deliberately small and transparent. It is a conversation aid, not an authority on language or a moderation tool.

## Tech

- React + TypeScript + Vite
- Vitest for the pure analysis rules
- Browser `localStorage` for recent cards
- No sign-in, backend, telemetry, or external API

## License

[MIT](LICENSE)
