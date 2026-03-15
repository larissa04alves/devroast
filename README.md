# DevRoast

> Paste your code. Get roasted.

DevRoast is a web app that receives a code snippet and returns a brutally honest, sarcastic AI review — complete with a score from 0 to 10 and line-by-line feedback on what went wrong (and why you should feel bad about it).

Built live during **[NLW (Next Level Week)](https://rocketseat.com.br)** by Rocketseat.

---

## What it does

- Paste any code snippet into the editor
- Toggle **roast mode** for maximum sarcasm (enabled by default, obviously)
- Hit **$ roast_my_code** and receive a score, a verdict, and detailed feedback per line
- Browse the **shame leaderboard** — the worst code ever submitted, immortalized forever

---

## Running locally

Make sure you have [Bun](https://bun.sh) installed.

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

```bash
bun dev       # development server
bun build     # production build
bun check     # lint + format (Biome)
```
