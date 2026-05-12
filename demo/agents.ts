/**
 * ATI Agents — Demo (Phase A)
 *
 * Hierarchical coordinator + specialist agents that react to athlete state
 * ticks and emit coaching cues.
 *
 * Architecture:
 *   - Specialists are deterministic functions analyzing a single dimension.
 *     They produce typed signals when something noteworthy happens.
 *   - Coordinator aggregates signals, enforces cadence and tone,
 *     and decides what to actually say.
 *
 * For the demo, the coordinator uses simple rules to pick a script
 * template per signal type. In Phase B we replace the template selection
 * with an LLM call to Claude.
 */

import type { Tick, AthleteProfile, LoopSummary } from './synthetic-athlete';

// ------------------------------------------------------------
// Signals from specialists
// ------------------------------------------------------------

export type SignalKind =
  | 'pace_on_plan'
  | 'pace_drift_subtle'
  | 'pace_drift_significant'
  | 'hr_drift_uncoupled'
  | 'cutoff_pressure'
  | 'recovery_observed'
  | 'course_feature_upcoming'
  | 'milestone_reached'
  | 'time_of_day_event';

export interface Signal {
  kind: SignalKind;
  priority: number;
  payload: Record<string, unknown>;
}

export interface AgentContext {
  profile: AthleteProfile;
  recentTicks: Tick[];
  completedLoops: LoopSummary[];
  raceStartedAtMs: number;
}

// ------------------------------------------------------------
// Specialist: Pace
// ------------------------------------------------------------

function paceAgent(ctx: AgentContext): Signal[] {
  const signals: Signal[] = [];
  const tick = ctx.recentTicks.at(-1);
  if (!tick || !tick.inMotion) return signals;

  const target = ctx.profile.targetPaceSecPerMile;

  if (ctx.completedLoops.length >= 1) {
    const lastLoop = ctx.completedLoops.at(-1)!;
    const loopDrift = lastLoop.pacePerMile - target;

    if (loopDrift < 5) {
      signals.push({ kind: 'pace_on_plan', priority: 1, payload: { loopDrift } });
    } else if (loopDrift >= 5 && loopDrift < 20) {
      signals.push({ kind: 'pace_drift_subtle', priority: 4, payload: { loopDrift, lastLoop: lastLoop.loopNumber } });
    } else if (loopDrift >= 20) {
      signals.push({ kind: 'pace_drift_significant', priority: 6, payload: { loopDrift, lastLoop: lastLoop.loopNumber } });
    }

    if (lastLoop.restAfterSec < 5 * 60) {
      signals.push({
        kind: 'cutoff_pressure',
        priority: 8,
        payload: { restSec: lastLoop.restAfterSec, lastLoop: lastLoop.loopNumber },
      });
    }
  }

  if (ctx.completedLoops.length >= 2) {
    const last = ctx.completedLoops.at(-1)!;
    const prev = ctx.completedLoops.at(-2)!;
    if (last.pacePerMile + 10 < prev.pacePerMile) {
      signals.push({
        kind: 'recovery_observed',
        priority: 5,
        payload: { loop: last.loopNumber, improvementSec: prev.pacePerMile - last.pacePerMile },
      });
    }
  }

  return signals;
}

// ------------------------------------------------------------
// Specialist: Biometric
// ------------------------------------------------------------

function biometricAgent(ctx: AgentContext): Signal[] {
  const signals: Signal[] = [];
  if (ctx.completedLoops.length < 3) return signals;

  const recent = ctx.completedLoops.slice(-3);
  const paceRange = Math.max(...recent.map(l => l.pacePerMile)) - Math.min(...recent.map(l => l.pacePerMile));
  const hrTrend = recent.at(-1)!.avgHr - recent.at(0)!.avgHr;

  if (paceRange < 15 && hrTrend > 8) {
    signals.push({
      kind: 'hr_drift_uncoupled',
      priority: 7,
      payload: { hrTrend, loops: recent.map(l => l.loopNumber) },
    });
  }

  return signals;
}

// ------------------------------------------------------------
// Specialist: Course
// ------------------------------------------------------------

function courseAgent(ctx: AgentContext): Signal[] {
  const signals: Signal[] = [];
  const tick = ctx.recentTicks.at(-1);
  if (!tick || !tick.inMotion) return signals;

  const approxLoopDurationSec = ctx.profile.loopLengthMiles * tick.paceSecPerMile;
  const progress = tick.loopElapsedSec / approxLoopDurationSec;

  if (progress > 0.55 && progress < 0.62) {
    signals.push({
      kind: 'course_feature_upcoming',
      priority: 2,
      payload: { feature: 'bridge_crossing', progress },
    });
  }

  return signals;
}

// ------------------------------------------------------------
// Specialist: Motivation
// ------------------------------------------------------------

function motivationAgent(ctx: AgentContext): Signal[] {
  const signals: Signal[] = [];
  const tick = ctx.recentTicks.at(-1);
  if (!tick) return signals;

  const milestones = [31.07, 50, 62.14, 100];
  for (const m of milestones) {
    const prevTick = ctx.recentTicks.at(-2);
    if (prevTick && prevTick.distanceCompletedMiles < m && tick.distanceCompletedMiles >= m) {
      signals.push({
        kind: 'milestone_reached',
        priority: 6,
        payload: { miles: m },
      });
    }
  }

  const sunriseSec = 21 * 3600;
  const prevTick = ctx.recentTicks.at(-2);
  if (prevTick && prevTick.timeSec < sunriseSec && tick.timeSec >= sunriseSec) {
    signals.push({
      kind: 'time_of_day_event',
      priority: 7,
      payload: { event: 'sunrise' },
    });
  }

  return signals;
}

// ------------------------------------------------------------
// Coordinator
// ------------------------------------------------------------

export interface Cue {
  timeSec: number;
  loopNumber: number;
  text: string;
  basedOn: SignalKind[];
  priority: number;
}

function minGapForPriority(priority: number): number {
  if (priority <= 2) return 30 * 60;
  if (priority <= 5) return 15 * 60;
  if (priority <= 7) return 8 * 60;
  return 5 * 60;
}

const SAME_KIND_SUPPRESS_SEC = 20 * 60;

function compose(signal: Signal, ctx: AgentContext): string {
  const name = ctx.profile.name;

  switch (signal.kind) {
    case 'pace_on_plan':
      return `${name}, that was a clean loop. You're right on plan. Hold this rhythm.`;
    case 'pace_drift_subtle': {
      const drift = signal.payload.loopDrift as number;
      return `Nice steady work. Your last loop came in about ${drift} seconds per mile off your target. Nothing dramatic. Watch your form and breathe easy on this one.`;
    }
    case 'pace_drift_significant': {
      const drift = signal.payload.loopDrift as number;
      return `Hey ${name}. Your last loop was about ${Math.round(drift / 60 * 10) / 10} minutes off pace. Let's reset. Slow start, settle in, find your rhythm by the half-mile mark.`;
    }
    case 'hr_drift_uncoupled':
      return `Your heart rate has been climbing the last few loops at the same pace. That's a hydration signal. Plan to drink at the next aid station, even if you don't feel thirsty.`;
    case 'cutoff_pressure': {
      const rest = signal.payload.restSec as number;
      return `That one was tight. Only ${Math.round(rest / 60)} minutes before the next bell. Use every second. Sit if you can. Eat something. Next loop is your reset.`;
    }
    case 'recovery_observed': {
      const improvement = signal.payload.improvementSec as number;
      return `That was a strong loop, ${name}. ${improvement} seconds per mile faster than the last one. Whatever you just did, do it again.`;
    }
    case 'course_feature_upcoming':
      return `Bridge coming up. Smooth surface, gentle rise. Light feet across.`;
    case 'milestone_reached': {
      const miles = signal.payload.miles as number;
      return `${name}, that's ${miles} miles. You've earned every one of them. Loop by loop.`;
    }
    case 'time_of_day_event':
      return `${name}. The sun's up. You ran through the night. Take a breath. Look around. Then back to work.`;
  }
}

export function coordinator(ctx: AgentContext, recentCues: Cue[]): Cue | null {
  const tick = ctx.recentTicks.at(-1);
  if (!tick) return null;

  const signals: Signal[] = [
    ...paceAgent(ctx),
    ...biometricAgent(ctx),
    ...courseAgent(ctx),
    ...motivationAgent(ctx),
  ];

  if (signals.length === 0) return null;

  const top = signals.sort((a, b) => b.priority - a.priority)[0];

  const isLoopBoundary = ctx.recentTicks.length >= 2 &&
    tick.loopNumber !== ctx.recentTicks.at(-2)!.loopNumber;
  if (top.kind === 'pace_on_plan' && !isLoopBoundary) return null;

  const lastCue = recentCues.at(-1);
  if (lastCue) {
    const gap = tick.timeSec - lastCue.timeSec;
    if (gap < minGapForPriority(top.priority)) return null;
  }

  const lastSameKind = [...recentCues].reverse().find(c => c.basedOn[0] === top.kind);
  if (lastSameKind && tick.timeSec - lastSameKind.timeSec < SAME_KIND_SUPPRESS_SEC) {
    return null;
  }

  return {
    timeSec: tick.timeSec,
    loopNumber: tick.loopNumber,
    text: compose(top, ctx),
    basedOn: signals.map(s => s.kind),
    priority: top.priority,
  };
}

// ------------------------------------------------------------
// Driver
// ------------------------------------------------------------

export function runAgents(
  ticks: Tick[],
  loops: LoopSummary[],
  profile: AthleteProfile,
): Cue[] {
  const cues: Cue[] = [];
  const window = 60;

  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i];
    const isLoopBoundary = i > 0 && tick.loopNumber !== ticks[i - 1].loopNumber;
    const isDemoMoment = tick.demoMoment !== undefined;
    const isCadenceTick = tick.timeSec % (5 * 60) === 0;

    if (!isLoopBoundary && !isDemoMoment && !isCadenceTick) continue;

    const completedLoops = loops.filter(l => l.endSec <= tick.timeSec);
    const ctx: AgentContext = {
      profile,
      recentTicks: ticks.slice(Math.max(0, i - window), i + 1),
      completedLoops,
      raceStartedAtMs: 0,
    };

    const cue = coordinator(ctx, cues);
    if (cue) cues.push(cue);
  }

  return cues;
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
}

if (require.main === module) {
  import('./synthetic-athlete').then(({ generateTimeline }) => {
    const { ticks, loops, profile } = generateTimeline();
    const cues = runAgents(ticks, loops, profile);

    console.log(`\nCoaching cues generated: ${cues.length}\n`);
    for (const cue of cues) {
      console.log(`[${fmtTime(cue.timeSec)}] Loop ${cue.loopNumber}  (priority ${cue.priority})`);
      console.log(`  ${cue.text}`);
      console.log(`  based on: ${cue.basedOn.join(', ')}\n`);
    }
  });
}
