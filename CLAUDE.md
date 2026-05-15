# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this project is

ATI (AI Trail Intelligence) is personalized in-race audio coaching for ultra and trail runners. We're building toward a demo video to send to the co-directors of Back Cove Backyard Ultra (Portland, ME, July 11, 2026) as the first customer conversation.

Read `README.md` first, then the `docs/` index.

## Working style for Jack

- Direct, conversational, professional but not formal
- Avoid hyphens in writing — they make text look AI-generated
- No excessive adjectives, no marketing-speak
- Concrete examples over abstract principles
- Substance over style

## Project conventions

- TypeScript strict mode
- Node 20+, pnpm for package management
- No browser storage APIs in any frontend code
- Secrets via `.env` files, never committed
- Phase A code lives in `demo/` and is throwaway. Phase B code lives in `platform/` and `ios/` and is durable. Don't mix them.
- ADRs for non-obvious choices go in `docs/decisions/`
- Issues drive work, not branches. Solo dev, so merge to main often.

## What's done

See `README.md` "Current state" section and the open GitHub issues at runaway-labs/runaway-trail-intelligence.

Briefly:
- All Phase 1 planning (value prop, target customer, POC scope, architecture, stack, course schema) is documented in `docs/`
- Working code for synthetic athlete generator, agents, and demo script is in `demo/`
- 8-moment demo script with voice direction is ready for TTS

## What's next

The path to a demo video sent to Back Cove:
1. Generate audio MP3s in ElevenLabs (cues and settings in `demo/voice-production.md`)
2. Build Back Cove course visualization (Mapbox GL JS or Leaflet, GPX from public source)
3. Assemble the video (Descript or Final Cut) — athlete dot moving the loop, state overlay, audio cues playing at right moments
4. Add opening and closing slides explaining what ATI is and proposing a conversation

After the demo lands the conversation, Phase B begins: real iOS app, Supabase backend, agent runtime, Jack runs Back Cove 2026 as the live POC.

## Things to know about Jack

- Senior Director at Slalom (recently promoted from Senior Principal)
- Strong AI architecture background (MSAP pattern designed for MDLive)
- Active marathon runner, in active training
- Building Run-a-Way (separate iOS + PostGIS project) in parallel — terrain engine work overlaps with ATI course data
- Owns Anthropic API access and Supabase already

## Things NOT to do

- Don't generate marketing-speak prose. Jack hates it.
- Don't reproduce copyrighted content (course descriptions from race websites, etc.) — paraphrase
- Don't add complexity for hypothetical future needs. Phase C+ decisions are deferred for a reason.
- Don't pivot the strategy without explicit conversation. Athlete experience > safety. Ultras > marathons. Audio first. These are settled.
