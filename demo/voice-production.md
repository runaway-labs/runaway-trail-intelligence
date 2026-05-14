# ATI Demo — Voice Production Sheet

Copy each cue into ElevenLabs. Adjust stability per the notes. Save as `moment-N.mp3`.

Recommended voice: test Adam, Brian, and Daniel with cue #1 first, then commit to one for all 8.

Baseline settings (apply to all unless overridden):
- Model: Eleven Multilingual v2 (or v3 if available)
- Similarity: 75
- Speaker boost: on

---

## Moment 1 — Loop 1 complete (0h52m)

**Cue:**
Loop one in the books, Jack. Twelve thirty pace, heart rate one thirty. You're exactly where you wanted to be. Sit down, drink something, and reset for the next one.

**Voice direction:** Warm, conversational. Slight pause after his name. No urgency.

- Stability: 60
- Style: 15

---

## Moment 2 — Pace drift caught early (5h20m, Loop 6)

**Cue:**
Quick check-in. Your last two loops have been about ten seconds per mile slower than your first four. Nothing dramatic. Could be early fatigue, could be the rest is too short. Just be honest with yourself about which one. We've got a long way to go.

**Voice direction:** Matter-of-fact, informational. Not warning. Like a friend stating an observation.

- Stability: 65
- Style: 10

---

## Moment 3 — Hydration signal (9h25m, Loop 10)

**Cue:**
Jack, your heart rate has climbed about fifteen beats over the last three loops, but your pace has barely moved. That's a hydration signal. You should be drinking even when you don't feel thirsty. Aid station coming up at the start. Grab extra water this round.

**Voice direction:** Calm, technical. Like a coach showing his work. Slight emphasis on "hydration signal".

- Stability: 65
- Style: 10

---

## Moment 4 — Bridge approach (11h34m, Loop 12)

**Cue:**
Bridge coming up. Quick downhill on the approach, smooth concrete across. Use it to relax your shoulders.

**Voice direction:** Brief, light. Almost casual. A few words, then silence.

- Stability: 70
- Style: 5

---

## Moment 5 — 50-mile milestone (11h50m, Loop 12)

**Cue:**
Fifty miles, Jack. You've now run further today than ninety nine percent of runners ever will. Don't think about what's left. Think about what you just did. Keep moving.

**Voice direction:** Quiet pride. Not celebration. Acknowledgment.

- Stability: 55
- Style: 20

---

## Moment 6 — Cutoff pressure, mental dip (13h56m, Loop 14)

**Cue:**
That one was tight. Three minutes before the bell. Sit. Eat something with sugar. This is the stretch you came here for, Jack. Not the easy hours at the start. This one. Every loop you complete from here, you earn twice.

**Voice direction:** Slower delivery. Confidence over urgency. The "this one" lands hard. Pause before the last sentence.

- Stability: 50
- Style: 25

---

## Moment 7 — Second wind (16h53m, Loop 17)

**Cue:**
Whoa. That loop was a minute per mile faster than the one before. Heart rate dropped four beats. Whatever you took in at that last rest, whatever you said to yourself, do it again. Exact same routine before the next bell.

**Voice direction:** A little brighter, slight surprise. The "whoa" is genuine. Then back to steady.

- Stability: 55
- Style: 20

---

## Moment 8 — Sunrise (19h10m, Loop 20)

**Cue:**
Jack. The sun's coming up over the cove. You ran through the whole night. Take ten seconds. Look at it. Most people will never know what this feels like. Then back to work.

**Voice direction:** Almost reverent. Long pause after "look at it." Quietest delivery in the script.

- Stability: 45
- Style: 30

---

## After generating

1. Listen to all 8 in sequence. Does the voice stay consistent? Does any cue sound off?
2. Regenerate any that feel wrong — ElevenLabs gives slight variation each generation, so a re-roll often fixes weird intonation
3. Drop the MP3s into `demo/audio/` in the repo (the .gitignore already excludes them from commit)
