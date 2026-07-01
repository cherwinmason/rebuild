# REBUILD

Personal fitness app. The Anchor Plan — 4 workouts a week, everything else flexes.

## Stack
- React + Vite
- Tailwind CSS
- lucide-react (icons)
- recharts (charts)
- vite-plugin-pwa (installable on mobile)

## Local dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Features
- Onboarding flow
- Workout logging (4 sessions: A/B/C/D)
- Weight + measurement tracking with charts
- Progress photos (compressed, stored locally)
- Achievements/badges
- Simple coach Q&A
- Data export/import
- Full PWA (installable on iPhone home screen)

## Data
All data lives in browser localStorage. Nothing sent to any server.
Use Settings → Export to back up your data.
