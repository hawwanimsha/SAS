# SAS Assessment System — Seenu Atoll School

AI-powered test paper analysis, student performance tracking, automated checklists and reports.

## Deploy to Railway (2 minutes)

1. Push this folder to a GitHub repo, or zip and upload to Railway
2. On Railway, set the environment variable:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
3. Deploy. Railway auto-detects Node.js and runs `npm start`

## Deploy to Render / Fly.io / any Node.js host

Same steps: push code, set `ANTHROPIC_API_KEY` env var, deploy.

## Run locally

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
```
Open http://localhost:3000

## How it works

- `server.js` — Express server that serves the app and proxies AI requests to Anthropic API
- `public/index.html` — Complete single-page app (syllabus data embedded, Chart.js for graphs)
- No database needed. All data lives in browser memory during the session.

## Features

- **AI test paper analysis** — upload PDF or paste text, AI maps each question to syllabus outcomes
- **Manual mapping fallback** — dropdown-based question mapping from embedded syllabus  
- **Student score analysis** — paste CSV, auto-compute achievement levels (FA/MA/A/B)
- **Charts** — pie charts, bar charts for questions, students, outcomes, indicators
- **Checklists** — auto-generated Outcome Assessment Record Sheets in school format
- **Reports** — AI-generated or template-based teacher assessment reports
