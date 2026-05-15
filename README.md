# Runaway Trail Intelligence (ATI)

Personalized in-race support for ultra and trail runners. Audio coaching delivered through the athlete's existing devices, adapted to their pace, terrain, biometrics, and race history.

## What this is

Ultra and trail races are remote and hard to monitor. ATI gives every runner on the course a coach in their ear who knows the terrain as well as the race director does. Race organizations partner with ATI to elevate the athlete experience; athletes opt in to deeper personalization on top of the baseline.

## Start here

If you're new to this repo (or this is future-Jack returning to it), read in this order:

1. [`docs/value-prop.md`](docs/value-prop.md) — what we're building and why
2. [`docs/target-customers.md`](docs/target-customers.md) — first customer is Back Cove Backyard Ultra, Portland ME (July 11, 2026)
3. [`docs/poc-scope.md`](docs/poc-scope.md) — three-phase plan, currently in Phase A
4. [`docs/architecture.md`](docs/architecture.md) — hierarchical coordinator + specialist agents (MSAP pattern)
5. [`docs/tech-stack.md`](docs/tech-stack.md) — TypeScript, Claude API, ElevenLabs, Supabase, iOS
6. [`docs/course-schema.md`](docs/course-schema.md) — PostGIS-based course data model

For working code and what's next on the build, see [`demo/README.md`](demo/README.md).

## Repo structure

```
runaway-trail-intelligence/
├── docs/         — architecture, value prop, decisions
├── demo/         — Phase A: simulated demo (active work)
├── platform/     — Phase B: production agent runtime and backend (planned)
├── ios/          — Phase B: athlete iOS app (planned)
├── data/         — course models and athlete profiles
└── gtm/          — one-pager, outreach, case studies
```

## Current state

**Phase A — building the demo video that gets sent to race directors at Back Cove Backyard Ultra.**

Completed:
- Value prop, target customer research, POC scope, agent architecture, tech stack, course schema (all in `docs/`)
- Synthetic athlete generator producing 24h timeline at Back Cove
- Hierarchical agent system with pace, biometric, course, motivation specialists
- 8-moment demo script with voice direction for TTS
- ElevenLabs voice production sheet

Remaining for Phase A demo video:
- [ ] Generate audio MP3s in ElevenLabs (see `demo/voice-production.md`)
- [ ] Build Back Cove course visualization (Mapbox or Leaflet)
- [ ] Assemble video — athlete dot moving the loop, state overlay, audio cues
- [ ] Send to Kelton and Mari at Back Cove

See open GitHub issues for the full backlog.

## Stack

- TypeScript, Node 20+
- Claude API (agent reasoning)
- ElevenLabs (TTS, calm coach voice)
- Supabase (Postgres + PostGIS + Edge Functions) — Phase B
- Swift / iOS — Phase B athlete app

## Run the demo code

```bash
npx tsx demo/demo-script.ts        # full 8-moment script with voice direction
npx tsx demo/synthetic-athlete.ts  # synthetic athlete summary by loop
npx tsx demo/agents.ts             # continuous coordinator output
```
