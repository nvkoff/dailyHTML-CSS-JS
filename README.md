# dailyHTML-CSS-JS

A Duolingo-style app for practicing frontend fundamentals. Bite-sized lessons
with multiple choice, predict-the-output, and fix-the-bug questions. Streaks,
XP, and hearts to keep it addictive.

Built with Next.js 16 (App Router), Clerk (Google auth), Neon Postgres +
Drizzle, and Tailwind v4.

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # fill in Clerk + Neon keys
npm run db:push              # push schema to your Neon DB
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

The app is designed to deploy directly to Vercel with two Marketplace
integrations providing all credentials.

### 1. Push to GitHub and import into Vercel

```bash
git add .
git commit -m "Bootstrap Daily Frontend"
gh repo create daily-html-css-js --public --push
```

Then import the repo at [vercel.com/new](https://vercel.com/new).

### 2. Add Clerk (auth)

Vercel dashboard → your project → **Integrations** → search "Clerk" → install.
This auto-provisions:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

In the Clerk dashboard, enable the **Google** social connection under
_User & Authentication → Social Connections_. That's the only provider you
need for MVP.

### 3. Add Neon Postgres

Vercel dashboard → **Storage** → **Create Database** → Neon (Marketplace).
This provisions `DATABASE_URL` automatically.

### 4. First-time schema push

Pull env vars locally and push the schema once:

```bash
npx vercel link
npx vercel env pull .env.local
npm run db:push
```

Redeploy in Vercel. Done.

---

## Adding lessons

Every lesson is a single JSON file under `content/lessons/<track>/`.
The `id` field must match `<track>/<slug>`.

Question types:

- `mcq` — multiple choice with optional code preview
- `predict` — code block + multiple choice, "what does this render / log?"
- `fix-bug` — CodeMirror editor. Grading is substring-based via
  `mustInclude` / `mustNotInclude`.

See any file in `content/lessons/css/` for a working template.

---

## Project layout

```
content/lessons/         # authored JSON lessons (versioned in git)
src/app/                 # Next.js App Router
  layout.tsx             # ClerkProvider wraps everything
  page.tsx               # marketing landing
  sign-in|sign-up/       # Clerk hosted UI
  learn/                 # protected — skill tree + lesson runner
src/components/          # UI + lesson components
src/db/                  # Drizzle schema + queries
src/lib/                 # content loader, actions, utils
src/middleware.ts        # Clerk route protection
```

---

## Roadmap

- [ ] Author HTML and JavaScript track lessons
- [ ] "Write code to match this preview" question type (live iframe diff)
- [ ] Daily goal + hearts refill logic
- [ ] Review mode: replay incorrectly-answered questions
- [ ] Basic profile page with XP-over-time chart
