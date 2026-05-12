# Runaway Trail Intelligence (ATI)

Personalized in-race support for ultra and trail runners. Audio coaching delivered through the athlete's existing devices, adapted to their pace, terrain, biometrics, and race history.

## What this is

Ultra and trail races are remote and hard to monitor. ATI gives every runner on the course a coach in their ear who knows the terrain as well as the race director does. Race organizations partner with ATI to elevate the athlete experience; athletes opt in to deeper personalization on top of the baseline.

## Repo structure

```
runaway-trail-intelligence/
├── demo/         — Phase A: simulated demo (this is where current code lives)
├── platform/     — Phase B: production agent runtime and backend (planned)
├── ios/          — Phase B: athlete iOS app (planned)
├── docs/         — architecture, decisions, value prop
├── data/         — course models and athlete profiles
└── gtm/          — one-pager, outreach, case studies
```

## Current state

Phase A — building the demo video that gets sent to race directors at Back Cove Backyard Ultra.

See open issues for the full backlog.

## Stack

- TypeScript, Node 20+
- Claude API (agent reasoning)
- ElevenLabs (TTS, calm coach voice)
- Supabase (Postgres + PostGIS + Edge Functions) — Phase B
- Swift / iOS — Phase B athlete app
