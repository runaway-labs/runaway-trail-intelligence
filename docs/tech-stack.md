# Tech Stack

Two horizons: what's enough for the demo (Phase A) and what we commit to for Phase B onward.

## Demo (Phase A) — get it built fast

The demo is a video, not a running system. Optimize for speed of iteration over architectural purity.

| Component | Choice | Why |
|---|---|---|
| Agent reasoning | Claude API (Sonnet 4.6) | Coordinator and motivation agents both benefit from strong reasoning. Fast iteration on prompts. |
| Specialist logic (pace, course) | TypeScript, plain functions | These are deterministic. No LLM needed. |
| Shared memory | JSON files, in-memory | Demo only. Throwaway. |
| Synthetic athlete data | Generated TypeScript script | Hand-tuned curves for pace, HR, lap times. Realistic enough to anchor specific demo moments. |
| Course model | GeoJSON + GPX from public Back Cove data | Strava heatmap, OpenStreetMap, or AllTrails as a source. |
| TTS | ElevenLabs | Calm coach voice. Better tonal control than alternatives. |
| Video assembly | Manual edit in Descript or Final Cut | Faster than automating. One-shot deliverable. |

## Phase B (live POC on Jack at Back Cove)

Real system, single athlete, lightweight infra.

| Component | Choice | Why |
|---|---|---|
| Athlete app | iOS, Swift, HealthKit | Jack has dev capability. Real-time HR/pace data. Native audio to AirPods. Shares foundation with Run-a-Way iOS work. |
| Backend | Supabase (Postgres + Edge Functions) | Jack already uses Supabase. PostGIS for course data. Edge Functions handle agent loop. Low ops overhead. |
| Agent runtime | TypeScript on Supabase Edge Functions | Same language as the iOS frontend's bridge layer. Edge Functions scale to zero. |
| Real-time data | Supabase Realtime channels | Stream HealthKit data from app to backend, stream cues back to app. |
| Agent reasoning | Claude API | Coordinator and motivation. Pace/course/biometric agents remain deterministic functions. |
| Shared memory | Postgres tables with RLS | Athlete profile, race plan, conversation history. Versioned. |
| TTS | ElevenLabs API | Consistent voice with the demo. |
| Audio delivery | iOS app -> AirPods (AVAudioPlayer) | Pre-generated audio clips streamed and played on cue. |
| Human-in-the-loop UI | Web dashboard for crew | Simple Next.js app. Approves/mutes cues before they hit athlete's ears. |
| Observability | Supabase logs + Sentry | Need to know what fired and what didn't during a 24-hour race. |

## Phase C+ (multi-athlete race-org deployment) — not committing yet

Decisions to revisit when we get there:
- Move agent runtime off Supabase Edge Functions if concurrency demands it (likely AWS Lambda or dedicated containers)
- Multi-tenant data model with race-org as top-level isolation boundary
- Athlete data source abstraction layer (Apple, Garmin, Coros all flow into normalized schema)
- Race-org dashboard for medical and ops
- Pricing and contract infrastructure

## Why this stack

- **Plays to existing skills and assets**: Swift, TypeScript, Supabase. No new learning curve for the POC.
- **Minimizes ops**: Supabase Edge Functions and Postgres mean no servers to babysit during a 24-hour race.
- **Cheap**: Demo costs a few dollars in API calls. POC costs maybe $20 in inference for a 24-hour race.
- **Defensible if it grows**: The agent architecture is portable. If we outgrow Supabase, we move runtime without rewriting the agents.
- **Shares foundation with Run-a-Way**: PostGIS course data and iOS frontend code can be reused. Two projects, one stack.

## Athlete data sources (Phase B onward)

**Recommended primary path: Apple Watch + iOS app**
- Direct HealthKit access for heart rate, pace, GPS, cadence
- Background workout sessions stay alive during long workouts
- Can stream data to a paired iOS app and out to a backend over cellular
- Native audio output to AirPods

**Other options (for Phase C+ multi-athlete deployments):**
- Garmin Connect IQ — restrictive on real-time streaming; better for race-org deployments where Garmin is dominant
- WHOOP API — continuous biometric but not truly real-time (sync delay)
- Bib chip timing (ChronoTrack, RaceResult, Athlinks) — race orgs collect this already; useful for course-segment awareness in race deployments

## Open questions

- ElevenLabs vs OpenAI TTS for the calm-coach voice — DECIDED: ElevenLabs (better tonal control)
- Whether to pre-generate common phrase audio (faster, cheaper) or stream TTS in real time (more dynamic)
- Cell coverage at Back Cove for live data streaming — Portland urban setting should be fine but worth verifying
