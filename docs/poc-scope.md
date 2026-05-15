# POC Scope — Demo-First Approach

The POC is structured in three phases, sequenced to land the Back Cove conversation and then earn the live deployment.

## Phase A: Simulated demo (the conversation starter)

A short video (2–3 minutes) showing what ATI would look like at Back Cove specifically. Built on a digital twin of the Back Cove loop with a simulated athlete and real audio coaching output. **This is the artifact that gets sent to Kelton and Mari.**

### What it needs

- Digital twin of the Back Cove loop (4.2 miles, flat gravel, bridge crossing)
- Simulated athlete with realistic pace, lap timing, biometric variation across a multi-hour run
- Agent watching the data and deciding when/what to say
- Audio output generated as actual TTS (ElevenLabs), played at the right moments in the video
- 8 illustrative moments scripted across the race

### Success criteria

- Kelton and Mari watch the video and immediately want to talk
- The course is recognizably theirs, not a generic stand-in
- The audio cues feel useful to a runner, not gimmicky

### Status

In progress. Synthetic athlete generator, agent architecture, and demo script are committed (see `demo/`). Audio generation in ElevenLabs and video assembly remain.

## Phase B: Live POC on the race director's course (Jack as athlete)

Register for Back Cove 2026 as a participant. Run the race with the ATI system instrumenting Jack in real time. System reads Jack's pace and biometrics, generates coaching cues, delivers them via AirPods. Co-directors observe how it works in practice.

### What it needs

- Live data ingest from Apple Watch (HealthKit) via paired iOS app
- Real-time agent loop running on Supabase Edge Functions
- Audio delivery to athlete's AirPods (pre-generated or streamed TTS)
- Course-aware coaching tied to Back Cove specifically
- Human-in-the-loop dashboard for crew to approve/mute cues

### Success criteria

- System runs the duration of the race without breaking
- Audio cues land at appropriate moments
- Co-directors see enough value to consider a paid 2027 engagement

## Phase C: Multi-athlete paid deployment

Out of POC scope. Tracked in GitHub issues for future planning.

## Demo deliverable (Phase A) — what it produces

A video file (MP4) that includes:

- Opening shot of the Back Cove loop with course overlay
- Simulated athlete data running across the screen (pace, lap time, heart rate, fatigue indicator)
- Audio cues playing at key moments, captioned and timestamped
- Brief closing slide explaining what the demo represents and proposing a conversation

The video is the artifact. It's what gets emailed to Kelton and Mari with the one-pager. No live system needs to be running yet.

## Technical scope for Phase A

What needs to exist by the end of this issue to produce the demo:

- [x] Back Cove course model (GPX import, segment definitions, elevation) — schema defined
- [x] Synthetic athlete generator (pace curve, lap timing, simulated biometrics over ~24 hours)
- [x] Agent prompt and decision loop (rules for when to speak, what to say, in what tone)
- [x] Demo script with 8 coaching moments and voice direction
- [ ] TTS pipeline for audio generation (ElevenLabs)
- [ ] Course visualization (Mapbox or Leaflet)
- [ ] Video assembly (Descript or Final Cut)
