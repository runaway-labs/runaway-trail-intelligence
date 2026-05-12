# ATI Demo (Phase A)

Goal: produce a short video showing what ATI would look like at Back Cove Backyard Ultra. The video is what gets sent to race directors to land the conversation. No production system needed yet.

## Files

- `synthetic-athlete.ts` — generates a realistic 24-hour timeline for a backyard ultra athlete at Back Cove. Pace, HR, lap times, demo moments.
- `agents.ts` — hierarchical coordinator + specialist agents. Pace, biometric, course, motivation. Produces coaching cues from athlete state.
- `demo-script.ts` — picks 8 high-quality coaching moments across the race and composes cues with voice direction for TTS. This is the script for the demo video.

## Run

```bash
npx tsx demo-script.ts     # full demo script with voice direction
npx tsx synthetic-athlete.ts  # synthetic athlete summary by loop
npx tsx agents.ts          # continuous coordinator output
```

## Next steps

1. Generate audio for each cue via ElevenLabs
2. Build a visualization of the Back Cove loop with the athlete dot moving
3. Assemble the video — overlay state, play audio at right moments
4. Add opening and closing slides
