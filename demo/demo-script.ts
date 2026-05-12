/**
 * ATI Demo Runner — Phase A
 *
 * Rather than ticking through 24 hours of synthetic data, this picks
 * the demo moments and composes a high-quality coaching cue for each.
 *
 * The goal is a video script: 8-12 moments that show the system's range
 * (technical pace coaching, biometric inference, course awareness, motivation)
 * with cues that sound like a real coach in your ear.
 *
 * In Phase B this is replaced by a continuous coordinator running on
 * real athlete data.
 */

import { generateTimeline } from './synthetic-athlete';

interface DemoMoment {
  timeSec: number;
  loopNumber: number;
  state: {
    pacePerMile: string;
    hrBpm: number;
    elapsed: string;
    distanceMiles: number;
    loopPaceSec: number;
    targetPaceSec: number;
    notes: string[];
  };
  cue: {
    text: string;
    basedOn: string[];
    voiceDirection: string;
  };
}

function fmtPace(secPerMile: number): string {
  const m = Math.floor(secPerMile / 60);
  const s = Math.round(secPerMile % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h${m.toString().padStart(2, '0')}m`;
}

function buildDemoScript(): DemoMoment[] {
  const { ticks, loops, profile } = generateTimeline();
  const moments: DemoMoment[] = [];

  // Moment 1: Loop 1 complete, pacing on plan
  const loop1 = loops[0];
  moments.push({
    timeSec: loop1.endSec,
    loopNumber: 1,
    state: {
      pacePerMile: fmtPace(loop1.pacePerMile),
      hrBpm: loop1.avgHr,
      elapsed: fmtElapsed(loop1.endSec),
      distanceMiles: profile.loopLengthMiles,
      loopPaceSec: loop1.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['baseline established', 'rest 7.5 min before next bell'],
    },
    cue: {
      text: `Loop one in the books, Jack. Twelve thirty pace, heart rate one thirty. You're exactly where you wanted to be. Sit down, drink something, and reset for the next one.`,
      basedOn: ['pace_on_plan', 'baseline_check'],
      voiceDirection: 'Warm, conversational. Slight pause after his name. No urgency.',
    },
  });

  // Moment 2: Loop 6 — pace drift caught early
  const loop6 = loops[5];
  moments.push({
    timeSec: loop6.startSec + 1200,
    loopNumber: 6,
    state: {
      pacePerMile: fmtPace(loop6.pacePerMile),
      hrBpm: loop6.avgHr,
      elapsed: fmtElapsed(loop6.startSec + 1200),
      distanceMiles: profile.loopLengthMiles * 5.5,
      loopPaceSec: loop6.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['pace +10s/mile from baseline', 'subtle drift, athlete may not notice'],
    },
    cue: {
      text: `Quick check-in. Your last two loops have been about ten seconds per mile slower than your first four. Nothing dramatic. Could be early fatigue, could be the rest is too short. Just be honest with yourself about which one. We've got a long way to go.`,
      basedOn: ['pace_drift_subtle', 'trend_analysis'],
      voiceDirection: 'Matter-of-fact, informational. Not warning. Like a friend stating an observation.',
    },
  });

  // Moment 3: Loop 10 — HR uncoupled from pace, hydration cue
  const loop10 = loops[9];
  moments.push({
    timeSec: loop10.startSec + 1500,
    loopNumber: 10,
    state: {
      pacePerMile: fmtPace(loop10.pacePerMile),
      hrBpm: loop10.avgHr,
      elapsed: fmtElapsed(loop10.startSec + 1500),
      distanceMiles: profile.loopLengthMiles * 9.5,
      loopPaceSec: loop10.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['HR +15 bpm over last 3 loops', 'pace flat, HR rising = cardiac drift'],
    },
    cue: {
      text: `Jack, your heart rate has climbed about fifteen beats over the last three loops, but your pace has barely moved. That's a hydration signal. You should be drinking even when you don't feel thirsty. Aid station coming up at the start. Grab extra water this round.`,
      basedOn: ['hr_drift_uncoupled', 'course_aware', 'tactical_cue'],
      voiceDirection: 'Calm, technical. Like a coach showing his work. Slight emphasis on "hydration signal".',
    },
  });

  // Moment 4: Loop 12 — Course awareness on the bridge
  const loop12 = loops[11];
  moments.push({
    timeSec: loop12.startSec + Math.round(loop12.durationSec * 0.6),
    loopNumber: 12,
    state: {
      pacePerMile: fmtPace(loop12.pacePerMile),
      hrBpm: loop12.avgHr,
      elapsed: fmtElapsed(loop12.startSec + Math.round(loop12.durationSec * 0.6)),
      distanceMiles: profile.loopLengthMiles * 11.6,
      loopPaceSec: loop12.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['approaching Tukey Bridge', '60% through loop'],
    },
    cue: {
      text: `Bridge coming up. Quick downhill on the approach, smooth concrete across. Use it to relax your shoulders.`,
      basedOn: ['course_feature_upcoming', 'micro_coaching'],
      voiceDirection: 'Brief, light. Almost casual. A few words, then silence.',
    },
  });

  // Moment 5: Loop 14 — cutoff pressure, mental dip
  const loop14 = loops[13];
  moments.push({
    timeSec: loop14.endSec,
    loopNumber: 14,
    state: {
      pacePerMile: fmtPace(loop14.pacePerMile),
      hrBpm: loop14.avgHr,
      elapsed: fmtElapsed(loop14.endSec),
      distanceMiles: profile.loopLengthMiles * 14,
      loopPaceSec: loop14.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['3 min before next bell', 'lowest mood signal so far', 'this is the hardest stretch'],
    },
    cue: {
      text: `That one was tight. Three minutes before the bell. Sit. Eat something with sugar. This is the stretch you came here for, Jack. Not the easy hours at the start. This one. Every loop you complete from here, you earn twice.`,
      basedOn: ['cutoff_pressure', 'motivation', 'reframe'],
      voiceDirection: 'Slower delivery. Confidence over urgency. The "this one" lands hard. Pause before the last sentence.',
    },
  });

  // Moment 6: 50-mile milestone
  const tickAt50 = ticks.find(t => t.distanceCompletedMiles >= 50);
  if (tickAt50) {
    moments.push({
      timeSec: tickAt50.timeSec,
      loopNumber: tickAt50.loopNumber,
      state: {
        pacePerMile: fmtPace(tickAt50.paceSecPerMile),
        hrBpm: tickAt50.hrBpm,
        elapsed: fmtElapsed(tickAt50.timeSec),
        distanceMiles: 50,
        loopPaceSec: tickAt50.paceSecPerMile,
        targetPaceSec: profile.targetPaceSecPerMile,
        notes: ['fifty mile mark crossed', 'milestone moment'],
      },
      cue: {
        text: `Fifty miles, Jack. You've now run further today than ninety nine percent of runners ever will. Don't think about what's left. Think about what you just did. Keep moving.`,
        basedOn: ['milestone_reached', 'perspective'],
        voiceDirection: 'Quiet pride. Not celebration. Acknowledgment.',
      },
    });
  }

  // Moment 7: Loop 17 — second wind, recovery
  const loop17 = loops[16];
  moments.push({
    timeSec: loop17.endSec,
    loopNumber: 17,
    state: {
      pacePerMile: fmtPace(loop17.pacePerMile),
      hrBpm: loop17.avgHr,
      elapsed: fmtElapsed(loop17.endSec),
      distanceMiles: profile.loopLengthMiles * 17,
      loopPaceSec: loop17.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['loop 17 faster than loop 16 by 69 sec/mile', 'caffeine kicked in', 'reinforce what worked'],
    },
    cue: {
      text: `Whoa. That loop was a minute per mile faster than the one before. Heart rate dropped four beats. Whatever you took in at that last rest, whatever you said to yourself, do it again. Exact same routine before the next bell.`,
      basedOn: ['recovery_observed', 'reinforcement'],
      voiceDirection: 'A little brighter, slight surprise. The "whoa" is genuine. Then back to steady.',
    },
  });

  // Moment 8: Sunrise — emotional anchor
  const loop20 = loops[19];
  moments.push({
    timeSec: loop20.startSec + 600,
    loopNumber: 20,
    state: {
      pacePerMile: fmtPace(loop20.pacePerMile),
      hrBpm: loop20.avgHr,
      elapsed: fmtElapsed(loop20.startSec + 600),
      distanceMiles: profile.loopLengthMiles * 19.5,
      loopPaceSec: loop20.pacePerMile,
      targetPaceSec: profile.targetPaceSecPerMile,
      notes: ['sunrise over Back Cove', 'survived the night', 'emotional high point'],
    },
    cue: {
      text: `Jack. The sun's coming up over the cove. You ran through the whole night. Take ten seconds. Look at it. Most people will never know what this feels like. Then back to work.`,
      basedOn: ['time_of_day_event', 'motivation', 'emotional_anchor'],
      voiceDirection: 'Almost reverent. Long pause after "look at it." Quietest delivery in the script.',
    },
  });

  return moments.sort((a, b) => a.timeSec - b.timeSec);
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

if (require.main === module) {
  const script = buildDemoScript();

  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ATI DEMO SCRIPT — Back Cove Backyard Ultra`);
  console.log(`  ${script.length} coaching moments across a 24-hour simulated race`);
  console.log(`${'='.repeat(70)}\n`);

  script.forEach((m, i) => {
    console.log(`MOMENT ${i + 1}  —  ${m.state.elapsed}  Loop ${m.loopNumber}`);
    console.log(`State: ${m.state.pacePerMile}/mi pace, ${m.state.hrBpm} bpm, ${m.state.distanceMiles.toFixed(1)} mi total`);
    console.log(`Notes: ${m.state.notes.join(' • ')}`);
    console.log(`Signals: ${m.cue.basedOn.join(', ')}`);
    console.log(`\n  CUE:\n  "${m.cue.text}"\n`);
    console.log(`  Voice: ${m.cue.voiceDirection}`);
    console.log(`\n${'-'.repeat(70)}\n`);
  });

  console.log('Total cues:', script.length);
  console.log('Avg per hour:', (script.length / 24).toFixed(2));
}

export { buildDemoScript, type DemoMoment };
