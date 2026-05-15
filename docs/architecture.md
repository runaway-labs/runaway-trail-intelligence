# Agent Architecture

Hierarchical coordinator + specialist agents. MSAP pattern (Minimal Shared Agent Platform) applied to the in-race coaching problem.

## Topology

```
                    +-----------------------+
                    |   Coordinator Agent   |
                    |                       |
                    | - decides if/when     |
                    |   to speak            |
                    | - enforces cadence    |
                    | - owns tone           |
                    +-----------+-----------+
                                |
                +---------------+---------------+---------------+
                |               |               |               |
       +--------v------+ +------v------+ +------v------+ +-----v--------+
       |  Pace Agent   | |  Biometric  | |   Course    | |  Motivation  |
       |               | |   Agent     | |   Agent     | |    Agent     |
       +---------------+ +-------------+ +-------------+ +--------------+
                |               |               |               |
                +---------------+---------------+---------------+
                                |
                    +-----------v-----------+
                    |    Shared Memory      |
                    |                       |
                    | - athlete profile     |
                    | - race plan           |
                    | - what's been said    |
                    | - baselines           |
                    +-----------------------+
                                |
                    +-----------v-----------+
                    |   Human-in-the-Loop   |
                    |    (POC: Jack/crew)   |
                    |    (Prod: athlete UI) |
                    +-----------------------+
                                |
                    +-----------v-----------+
                    |   Audio Delivery      |
                    |   (TTS -> AirPods)    |
                    +-----------------------+
```

## Design principle

Specialists are deterministic functions analyzing a single dimension. Coordinator handles aggregation, cadence, tone, and final composition. This split means:

- Specialists are easy to test (pure functions)
- Coordinator can use LLM reasoning where it matters most (composition, prioritization)
- New specialists can be added without rewriting the core

## Agent responsibilities

### Coordinator

- Receives signals from all specialists
- Decides whether the current moment warrants a coaching cue
- Enforces cadence: minimum gap between cues by priority
- Owns tone consistency (calm coach, steady, informational)
- Composes the final message

### Pace Agent

- Tracks current pace vs target
- Watches lap-over-lap drift
- Flags when athlete is on track to miss cutoff
- Predicts finish probability based on current trajectory

### Biometric Agent

- Heart rate trends and zones
- Signs of overexertion (sustained spike above lactate threshold)
- Signs of recovery (return to baseline during rest)
- Hydration and fueling cue triggers (HR drift unexplained by effort)

### Course Agent

- Athlete's current position on the loop
- Upcoming course features (bridge, climb, aid station, technical section)
- Elevation context relative to athlete's recent effort

### Motivation Agent

- Pulls from athlete profile (PRs, prior races, training history)
- Mile and lap milestones
- Time-of-day awareness (sunrise/sunset moments are emotional for ultra runners)
- Suppressed by default; only triggers on coordinator request

## Signal types

```typescript
type SignalKind =
  | 'pace_on_plan'
  | 'pace_drift_subtle'
  | 'pace_drift_significant'
  | 'hr_drift_uncoupled'
  | 'cutoff_pressure'
  | 'recovery_observed'
  | 'course_feature_upcoming'
  | 'milestone_reached'
  | 'time_of_day_event';
```

Each signal has a priority (0–10) and a typed payload.

## Cadence rules

- Priority 1–2 (informational): only at loop boundaries, at most once per 30 min
- Priority 3–5 (notable): at most once per 15 min
- Priority 6–7 (significant): at most once per 8 min
- Priority 8+ (urgent): at most once per 5 min for the same signal kind

Same-kind signal suppression: 20 minutes by default. The athlete heard you. They don't need to hear it again 5 minutes later.

## Shared Memory (MSAP pattern)

Persistent state the agents read from and write to:

- **Athlete profile**: name, baseline HR, paces, race history, training load
- **Race plan**: target distance, target pace, fueling plan, mental cues athlete wants to hear
- **Conversation history**: what cues have been delivered, athlete acknowledgments, mutes
- **Race state**: current lap, time elapsed, weather, other athletes still in (Phase C+)

## Tone and personality

**Calm coach, steady, informational.** Never urgent unless safety. Athlete's name used sparingly. Specifics over generalities ("you're 12 seconds slower on this loop" beats "you're slowing down"). Acknowledge what they're doing well before flagging what to adjust.

## Human-in-the-loop

**Phase B (POC)**: Jack or a designated crew member can mute, approve, or override before any cue plays. Audit log of all decisions.

**Phase C+**: Athlete pre-race configures channel and aggressiveness. Crew can take over from an app. Race-org medical can flag concerns that route through the coordinator.

## Demo-specific notes (Phase A)

The simulated demo doesn't need all agents fully built. Minimum viable agent stack for the demo:
- Coordinator
- Pace Agent
- Course Agent
- Motivation Agent (light, scripted for demo moments)

Biometric agent can be stubbed for the demo since synthetic biometrics are hand-crafted to set up specific cues.

## Implementation

For the demo (Phase A), the coordinator uses simple template selection per signal type. See `demo/agents.ts`.

For Phase B, the template selection is replaced with an LLM call to Claude that composes the message given the signal, the athlete profile, and conversation history.

## Streaming and latency

- Cue generation should complete in <2 seconds from trigger to audio out
- Most cues are short, most ticks don't fire
- Cost: low. Demo costs a few dollars in API calls. POC costs maybe $20 in inference for a 24-hour race.
