/**
 * Synthetic Athlete Generator — ATI Demo (Phase A)
 *
 * Generates a realistic multi-hour timeline for a backyard ultra athlete
 * at Back Cove (4.2 mile loop, 60 minute cutoff).
 *
 * Output: a JSON array of tick events, one per 10 seconds, including
 * pace, heart rate, elevation, fatigue, lap state, and triggered coaching moments.
 *
 * Designed to produce specific demo moments:
 *   - Hour 6: pace drift starts (subtle, coaching catches it early)
 *   - Hour 10: HR climbs at same pace (dehydration cue)
 *   - Hour 14: deep mental dip, athlete near cutoff (motivational cue)
 *   - Hour 17: caffeine kicks in, athlete catches second wind (acknowledgment cue)
 *   - Hour 20: sunrise, emotional moment (motivation agent fires)
 */

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type DemoMoment =
  | 'pace_drift_early'
  | 'hr_drift_hydration'
  | 'mental_dip_cutoff'
  | 'second_wind'
  | 'sunrise_emotional';

export interface AthleteProfile {
  name: string;
  baselineHrBpm: number;
  aerobicHrBpm: number;
  lactateThresholdHr: number;
  targetPaceSecPerMile: number;
  loopLengthMiles: number;
  loopCutoffSec: number;
}

export interface Tick {
  timeSec: number;
  loopNumber: number;
  loopElapsedSec: number;
  inMotion: boolean;
  paceSecPerMile: number;
  hrBpm: number;
  elevationFt: number;
  distanceCompletedMiles: number;
  fatigue01: number;
  demoMoment?: DemoMoment;
}

export interface LoopSummary {
  loopNumber: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  pacePerMile: number;
  avgHr: number;
  restAfterSec: number;
}

// ------------------------------------------------------------
// Athlete profile — Jack-ish
// ------------------------------------------------------------

const JACK: AthleteProfile = {
  name: 'Jack',
  baselineHrBpm: 52,
  aerobicHrBpm: 135,
  lactateThresholdHr: 170,
  targetPaceSecPerMile: 12 * 60 + 30,
  loopLengthMiles: 4.2,
  loopCutoffSec: 60 * 60,
};

// ------------------------------------------------------------
// Loop generator
// ------------------------------------------------------------

function planLoop(loop: number, profile: AthleteProfile): {
  targetPaceSec: number;
  expectedHr: number;
  notes: DemoMoment[];
} {
  const base = profile.targetPaceSecPerMile;
  const notes: DemoMoment[] = [];

  let expectedHr = profile.aerobicHrBpm + Math.min(loop * 0.8, 25);

  if (loop <= 4) {
    return { targetPaceSec: base, expectedHr, notes };
  }

  if (loop <= 8) {
    const drift = (loop - 4) * 5;
    if (loop === 6) notes.push('pace_drift_early');
    return { targetPaceSec: base + drift, expectedHr, notes };
  }

  if (loop <= 12) {
    const paceDrift = 30 + (loop - 8) * 8;
    expectedHr += (loop - 8) * 3;
    if (loop === 10) notes.push('hr_drift_hydration');
    return { targetPaceSec: base + paceDrift, expectedHr, notes };
  }

  if (loop <= 18) {
    if (loop === 14) {
      notes.push('mental_dip_cutoff');
      return { targetPaceSec: 13 * 60 + 30, expectedHr: expectedHr + 5, notes };
    }
    if (loop === 17) {
      notes.push('second_wind');
      return { targetPaceSec: 12 * 60 + 45, expectedHr: expectedHr - 4, notes };
    }
    const paceDrift = 60 + (loop - 12) * 6;
    expectedHr += (loop - 12) * 1.5;
    return { targetPaceSec: base + paceDrift, expectedHr, notes };
  }

  if (loop === 20) {
    notes.push('sunrise_emotional');
  }
  const paceDrift = 80 + (loop - 18) * 4;
  expectedHr += (loop - 12) * 1.2;
  return { targetPaceSec: base + paceDrift, expectedHr, notes };
}

// ------------------------------------------------------------
// Tick generator helpers
// ------------------------------------------------------------

function paceAtTick(targetPace: number, loopElapsedSec: number, seed: number): number {
  const osc = Math.sin((loopElapsedSec / 60) * 0.7 + seed) * 8;
  const jitter = pseudoRandom(seed + loopElapsedSec) * 6 - 3;
  return Math.max(targetPace + osc + jitter, 9 * 60);
}

function hrAtTick(
  prevHr: number,
  expectedHr: number,
  inMotion: boolean,
  baselineHr: number,
): number {
  const target = inMotion ? expectedHr : Math.max(baselineHr + 30, prevHr - 12);
  const responseRate = inMotion ? 0.04 : 0.08;
  return prevHr + (target - prevHr) * responseRate;
}

function elevationAtTick(loopElapsedSec: number, loopDurationSec: number): number {
  const progress = loopElapsedSec / loopDurationSec;
  const bridge = Math.exp(-Math.pow((progress - 0.6) * 12, 2)) * 12;
  const baseline = Math.sin(progress * Math.PI * 2) * 4;
  return 10 + baseline + bridge;
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ------------------------------------------------------------
// Main timeline generator
// ------------------------------------------------------------

export interface GeneratorOptions {
  profile?: AthleteProfile;
  totalLoops?: number;
  tickIntervalSec?: number;
}

export function generateTimeline(opts: GeneratorOptions = {}): {
  ticks: Tick[];
  loops: LoopSummary[];
  profile: AthleteProfile;
} {
  const profile = opts.profile ?? JACK;
  const totalLoops = opts.totalLoops ?? 24;
  const tickInterval = opts.tickIntervalSec ?? 10;

  const ticks: Tick[] = [];
  const loops: LoopSummary[] = [];

  let currentTimeSec = 0;
  let totalDistance = 0;
  let prevHr = profile.baselineHrBpm + 10;
  let fatigue = 0;

  for (let loop = 1; loop <= totalLoops; loop++) {
    const plan = planLoop(loop, profile);
    const loopDuration = plan.targetPaceSec * profile.loopLengthMiles;

    if (loopDuration > profile.loopCutoffSec) break;

    const loopStartSec = currentTimeSec;
    let hrSum = 0;
    let hrCount = 0;
    let demoMomentEmitted = false;

    for (let t = 0; t < loopDuration; t += tickInterval) {
      const pace = paceAtTick(plan.targetPaceSec, t, loop * 1000 + t);
      const hr = hrAtTick(prevHr, plan.expectedHr, true, profile.baselineHrBpm);
      const elevation = elevationAtTick(t, loopDuration);

      const milesThisTick = tickInterval / pace;
      totalDistance += milesThisTick;

      let demoMoment: DemoMoment | undefined;
      if (!demoMomentEmitted && plan.notes.length > 0 && t > loopDuration * 0.4) {
        demoMoment = plan.notes[0];
        demoMomentEmitted = true;
      }

      fatigue = Math.min(1, fatigue + 0.00006);

      ticks.push({
        timeSec: currentTimeSec + t,
        loopNumber: loop,
        loopElapsedSec: t,
        inMotion: true,
        paceSecPerMile: Math.round(pace),
        hrBpm: Math.round(hr),
        elevationFt: Math.round(elevation * 10) / 10,
        distanceCompletedMiles: Math.round(totalDistance * 100) / 100,
        fatigue01: Math.round(fatigue * 1000) / 1000,
        demoMoment,
      });

      prevHr = hr;
      hrSum += hr;
      hrCount++;
    }

    const loopEndSec = currentTimeSec + loopDuration;
    const restDuration = profile.loopCutoffSec - loopDuration;

    for (let t = 0; t < restDuration; t += tickInterval) {
      const hr = hrAtTick(prevHr, profile.aerobicHrBpm - 20, false, profile.baselineHrBpm);
      fatigue = Math.min(1, fatigue + 0.00002);
      ticks.push({
        timeSec: loopEndSec + t,
        loopNumber: loop,
        loopElapsedSec: loopDuration + t,
        inMotion: false,
        paceSecPerMile: 0,
        hrBpm: Math.round(hr),
        elevationFt: 10,
        distanceCompletedMiles: Math.round(totalDistance * 100) / 100,
        fatigue01: Math.round(fatigue * 1000) / 1000,
      });
      prevHr = hr;
    }

    loops.push({
      loopNumber: loop,
      startSec: loopStartSec,
      endSec: loopEndSec,
      durationSec: Math.round(loopDuration),
      pacePerMile: Math.round(plan.targetPaceSec),
      avgHr: Math.round(hrSum / hrCount),
      restAfterSec: Math.round(restDuration),
    });

    currentTimeSec += profile.loopCutoffSec;
  }

  return { ticks, loops, profile };
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

function fmtPace(secPerMile: number): string {
  const m = Math.floor(secPerMile / 60);
  const s = Math.round(secPerMile % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h${m.toString().padStart(2, '0')}m`;
}

if (require.main === module) {
  const { ticks, loops, profile } = generateTimeline();

  console.log(`\nSynthetic athlete: ${profile.name}`);
  console.log(`Target pace: ${fmtPace(profile.targetPaceSecPerMile)}/mile`);
  console.log(`Loop: ${profile.loopLengthMiles} miles, ${profile.loopCutoffSec / 60} min cutoff\n`);

  console.log('Loop summary:');
  console.log('Loop  Pace      AvgHR   Rest    StartTime   DemoMoment');
  console.log('----  --------  ------  ------  ----------  -----------------------');
  for (const loop of loops) {
    const tickWithMoment = ticks.find(
      t => t.loopNumber === loop.loopNumber && t.demoMoment,
    );
    const moment = tickWithMoment?.demoMoment ?? '';
    console.log(
      `${loop.loopNumber.toString().padStart(4)}  ${fmtPace(loop.pacePerMile).padEnd(8)}  ${loop.avgHr.toString().padStart(6)}  ${(loop.restAfterSec / 60).toFixed(1).padStart(5)}m  ${fmtTime(loop.startSec).padEnd(10)}  ${moment}`,
    );
  }

  console.log(`\nTotal ticks: ${ticks.length}`);
  console.log(`Total loops completed: ${loops.length}`);
  console.log(`Total distance: ${(loops.length * profile.loopLengthMiles).toFixed(1)} miles`);
  console.log(`Total race time: ${fmtTime(loops[loops.length - 1].endSec)}\n`);

  const demoTicks = ticks.filter(t => t.demoMoment);
  console.log(`Demo moments triggered: ${demoTicks.length}`);
  for (const t of demoTicks) {
    console.log(
      `  ${fmtTime(t.timeSec).padEnd(8)} loop ${t.loopNumber.toString().padStart(2)}  ${t.demoMoment} (pace ${fmtPace(t.paceSecPerMile)}, HR ${t.hrBpm})`,
    );
  }
  console.log();
}
