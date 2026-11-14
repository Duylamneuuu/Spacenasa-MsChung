const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const build = process.env.EXPEDITION_TEST_BUILD;
assert.ok(build, 'Run with node scripts/test-engine.cjs');
const {
  DRIVE_STEP, NEUTRAL, evaluateMission, garageStatus, getInitialState,
  payload, performScienceAction, preflight, previewRoute, siteAt, stepDrive, swapAtLander,
} = require(path.join(build, 'sim', 'expedition.js'));
const { DUNE_NORTH, MISSIONS, SITES } = require(path.join(build, 'content', 'expedition.js'));
const {
  CAPACITY, DEFAULT_LOADOUT, MODULES, RESERVE, SWAP_CREDITS, SWAP_MINUTES, key,
} = require(path.join(build, 'data', 'expedition.js'));

const DUNE = 'dune-crossing';
const FIRST = 'first-survey';
const forward = { ...NEUTRAL, forward: true };
const brake = { ...NEUTRAL, brake: true };
const recharge = { type: 'recharge', minutes: 10 };
const transmit = { type: 'transmit' };
const wideLoadout = { ...DEFAULT_LOADOUT, wheel: 'wide' };
const gap = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const near = (actual, expected) => assert.ok(
  Math.abs(actual - expected) < 1e-8, `expected ${actual} to be close to ${expected}`,
);

function assertRejected(state, next, reason) {
  assert.match(next.reason, reason);
  assert.deepEqual(next, { ...state, reason: next.reason });
}

function driveTo(state, target) {
  assert.equal(state.pose.speed, 0);
  const heading = Math.atan2(target.x - state.position.x, target.z - state.position.z);
  const tolerance = 0.18;
  const tick = (input) => {
    const result = stepDrive(state, input, DRIVE_STEP);
    assert.equal(result.stopped, false, result.state.reason);
    assert.equal(result.state.outcome, null);
    state = result.state;
  };

  // Pivot before each leg using the same steering and fixed timestep as the player.
  for (let i = 0; i < 240; i++) {
    const delta = heading - state.pose.heading;
    const turn = Math.atan2(Math.sin(delta), Math.cos(delta));
    if (Math.abs(turn) < 0.008) break;
    tick({ ...NEUTRAL, left: turn > 0, right: turn < 0 });
  }
  for (let i = 0; i < 2400 && gap(state.position, target) > tolerance; i++) tick(forward);
  assert.ok(gap(state.position, target) <= tolerance, `missed waypoint ${key(target)}`);
  for (let i = 0; i < 60 && state.pose.speed !== 0; i++) tick(brake);
  assert.equal(state.pose.speed, 0);
  assert.ok(gap(state.position, target) < 0.35, `overshot waypoint ${key(target)}`);
  return state;
}

test('stepDrive replays fixed inputs deterministically, including steering and reverse', () => {
  const initial = getInitialState(FIRST);
  const snapshot = structuredClone(initial);
  const script = [
    [NEUTRAL, 30],
    [forward, 80],
    [{ ...forward, left: true }, 25],
    [brake, 30],
    [{ ...NEUTRAL, reverse: true }, 35],
    [brake, 30],
  ];
  const replay = () => {
    let state = initial;
    return script.map(([input, frames]) => {
      for (let i = 0; i < frames; i++) {
        const result = stepDrive(state, input, DRIVE_STEP);
        assert.equal(result.stopped, false, result.state.reason);
        state = result.state;
      }
      return state;
    });
  };

  const states = replay();
  assert.deepEqual(states, replay());
  assert.deepEqual(initial, snapshot);
  assert.deepEqual(states[0], initial);
  assert.ok(states[1].position.x > initial.position.x);
  assert.ok(states[2].pose.heading > states[1].pose.heading);
  assert.equal(states[3].pose.speed, 0);
  assert.ok(states[4].pose.speed < 0);
  assert.equal(states[5].pose.speed, 0);
  assert.ok(states[5].trace.length > 1);
  assert.ok(states[5].elapsed > 0 && states[5].distance > 0);
  near(states[5].used, CAPACITY - states[5].battery);
  near(states[5].used, states[5].energyByTerrain.hard);
});

test('a firm-ground preview does not dictate where the rover drives or what it spends', () => {
  const initial = getInitialState(DUNE, wideLoadout);
  const snapshot = structuredClone(initial);
  const north = [{ x: 2, z: 0 }];
  const preview = previewRoute(initial, north);
  assert.deepEqual(initial, snapshot);
  assert.equal(preview.blocked, null);
  assert.equal(preview.risk, 'low');
  assert.ok(preview.unknown > 0);
  assert.ok(preview.energy[0] < preview.energy[1]);
  assert.ok(preview.minutes[0] < preview.minutes[1]);
  assert.deepEqual(stepDrive(initial, NEUTRAL, DRIVE_STEP).state, initial);

  // Drive the same approximate distance east, entering a terrain the plan avoids.
  const actual = driveTo(initial, { x: 7, z: 5 });
  assert.ok(actual.energyByTerrain.sand > 0);
  assert.ok(gap(actual.position, north[0]) > 5);
  assert.ok(actual.used < preview.energy[0], 'wide wheels spend less energy on this sandy deviation');
  assert.ok(actual.elapsed > preview.minutes[1], 'the sandy deviation takes longer');
  assert.deepEqual(previewRoute(initial, north), preview);
});

test('light wheels hit a surveyed safety stop when driven straight into the dunes', () => {
  const initial = getInitialState(DUNE);
  const plan = previewRoute(initial, [SITES.strata.cell]);
  assert.equal(plan.risk, 'high');
  assert.ok(plan.warnings.some((warning) => /grip limit/.test(warning)));

  let state = initial;
  for (let i = 0; i < 2400; i++) {
    const result = stepDrive(state, forward, DRIVE_STEP);
    if (result.stopped) {
      assert.match(result.state.reason, /safety stop.*grip limit/i);
      assert.equal(result.state.outcome, null);
      assert.equal(result.state.pose.speed, 0);
      assert.equal(result.state.stops, 1);
      assert.equal(result.distance, 0);
      assert.deepEqual(result.state.position, state.position);
      assert.equal(result.state.battery, state.battery);
      assert.equal(result.state.elapsed, state.elapsed);
      assert.equal(Object.keys(result.state.surveyed).length, Object.keys(state.surveyed).length + 1);
      return;
    }
    state = result.state;
  }
  assert.fail('Expected the light wheels to stop on the direct dune route');
});

for (const { name, loadout, route, usesSand } of [
  { name: 'wide wheels via the dune shortcut', loadout: wideLoadout, route: [SITES.strata.cell], usesSand: true },
  { name: 'light wheels via the north detour', loadout: DEFAULT_LOADOUT, route: DUNE_NORTH, usesSand: false },
]) {
  test(`Dune Crossing succeeds with ${name}`, () => {
    assert.deepEqual(preflight(DUNE, loadout), []);
    let state = route.reduce(driveTo, getInitialState(DUNE, loadout));
    assert.equal(state.stops, 0);
    assert.equal(siteAt(state.position), 'strata');
    assert.equal(state.energyByTerrain.sand > 0, usesSand);
    assert.equal(state.energyByTerrain.rock, 0);

    state = performScienceAction(state, { type: 'analyze', site: 'strata' });
    assert.deepEqual(state.pending.map((sample) => sample.site), ['strata']);
    state = performScienceAction(state, transmit);
    assert.deepEqual(state.delivered.map((sample) => sample.site), ['strata']);
    assert.equal(state.science, SITES.strata.science);
    assert.equal(state.credits, SITES.strata.credits);
    assert.ok(state.battery >= RESERVE);
    assert.ok(state.elapsed < MISSIONS[DUNE].limit);
    assert.equal(evaluateMission(state), 'success');
  });
}

test('First Survey earns partial credit for one downlink and never rewards duplicates', () => {
  const analyze = { type: 'analyze', site: 'basalt' };
  const parked = driveTo(getInitialState(FIRST), SITES.basalt.cell);
  assert.equal(evaluateMission(parked), 'failure');

  const analyzed = performScienceAction(parked, analyze);
  assert.deepEqual(analyzed.pending.map((sample) => sample.site), ['basalt']);
  assert.equal(analyzed.science, 0);
  assert.equal(analyzed.credits, 0);
  assert.equal(evaluateMission(analyzed), 'failure');
  assertRejected(analyzed, performScienceAction(analyzed, analyze), /already been analyzed/i);

  const delivered = performScienceAction(analyzed, transmit);
  assert.deepEqual(delivered.pending, []);
  assert.deepEqual(delivered.delivered, analyzed.pending);
  assert.equal(delivered.science, SITES.basalt.science);
  assert.equal(delivered.credits, SITES.basalt.credits);
  assert.equal(evaluateMission(delivered), 'partial');
  assertRejected(delivered, performScienceAction(delivered, analyze), /already been analyzed/i);
  assertRejected(delivered, performScienceAction(delivered, transmit), /no new data/i);

  const deadline = { ...delivered, elapsed: MISSIONS[FIRST].limit };
  const ended = stepDrive(deadline, forward, DRIVE_STEP);
  assert.equal(ended.stopped, true);
  assert.equal(ended.state.outcome, 'partial');
  assert.equal(ended.state.science, delivered.science);
  assert.equal(ended.state.credits, delivered.credits);
});

test('solar recharge requires parking in sunlight and caps charging at battery capacity', () => {
  const initial = getInitialState(FIRST);
  assertRejected(initial, performScienceAction(initial, recharge), /already full/i);

  const moving = stepDrive({ ...initial, battery: CAPACITY - 2 }, forward, DRIVE_STEP).state;
  assert.ok(moving.pose.speed > 0);
  assertRejected(moving, performScienceAction(moving, recharge), /park the rover/i);

  const shaded = { ...initial, battery: CAPACITY - 2, position: { x: 12, z: 8 } };
  assertRejected(shaded, performScienceAction(shaded, recharge), /insufficient sunlight/i);

  const parked = { ...initial, battery: CAPACITY - 2 };
  const charged = performScienceAction(parked, recharge);
  assert.equal(charged.battery, CAPACITY);
  assert.equal(charged.charged, 2);
  assert.equal(charged.used, 0);
  assert.equal(charged.elapsed, recharge.minutes);
});

test('driving can cross the planning reserve but cannot spend below operating power', () => {
  const initial = getInitialState(FIRST);
  const atReserve = { ...initial, battery: RESERVE };
  assert.ok(previewRoute(atReserve, [{ x: 3, z: 5 }]).warnings.some((warning) => /reserve/i));
  const operating = stepDrive(atReserve, forward, DRIVE_STEP);
  assert.ok(operating.distance > 0);
  assert.ok(operating.state.battery < RESERVE);

  const depleted = { ...initial, battery: 1 };
  const stopped = stepDrive(depleted, forward, DRIVE_STEP);
  assert.equal(stopped.stopped, true);
  assert.equal(stopped.distance, 0);
  assert.match(stopped.state.reason, /park and recharge/i);
  assert.equal(stopped.state.outcome, null);
  assert.equal(stopped.state.pose.speed, 0);
  assert.equal(stopped.state.battery, 1);
  assert.equal(stopped.state.elapsed, depleted.elapsed);
  assert.deepEqual(stopped.state.position, depleted.position);
  assert.ok(performScienceAction(stopped.state, recharge).battery > 1);

  const shaded = { ...depleted, position: { x: 12, z: 8 } };
  const stranded = stepDrive(shaded, forward, DRIVE_STEP);
  assert.equal(stranded.stopped, true);
  assert.equal(stranded.state.outcome, 'failure');
  assert.ok(stranded.state.battery >= 0 && stranded.state.battery < 1);
  assert.match(stranded.state.reason, /insufficient operating power/i);
});

test('science actions respect available energy and the operating threshold', () => {
  const scan = { type: 'scan' };
  const initial = getInitialState(FIRST);
  const exact = performScienceAction({ ...initial, battery: 7 }, scan);
  assert.equal(exact.battery, 1);
  assert.equal(exact.outcome, null);
  assert.ok(Object.keys(exact.surveyed).length > Object.keys(initial.surveyed).length);

  const empty = performScienceAction({ ...initial, battery: 6 }, scan);
  assert.equal(empty.battery, 0);
  assert.equal(empty.outcome, 'failure');
  assert.match(empty.reason, /operating threshold/i);

  const insufficient = { ...initial, battery: 5 };
  assertRejected(insufficient, performScienceAction(insufficient, scan), /not enough energy/i);
});

test('spares count against launch limits and swapping changes the mounted mass at the lander', () => {
  const withSpare = { ...DEFAULT_LOADOUT, spares: ['wide'] };
  const baseline = payload(DEFAULT_LOADOUT);
  const before = payload(withSpare);
  assert.equal(before.roverMass, baseline.roverMass);
  assert.equal(before.spareMass, MODULES.wide.mass);
  assert.equal(before.totalMass, baseline.totalMass + MODULES.wide.mass);
  assert.equal(before.budget, baseline.budget + MODULES.wide.cost);
  assert.deepEqual(preflight(DUNE, withSpare), []);

  const overloaded = { ...withSpare, spares: ['wide', 'reinforced', 'stereo'] };
  const issues = preflight(DUNE, overloaded);
  assert.ok(issues.some((issue) => /payload exceeds the limit/i.test(issue)));
  assert.ok(issues.some((issue) => /design exceeds the budget/i.test(issue)));
  assert.ok(preflight(DUNE, { ...withSpare, spares: ['light'] }).some((issue) => /same module/i.test(issue)));

  const initial = getInitialState(DUNE, withSpare);
  assert.match(garageStatus(initial, 'wide'), /requires .* RC/i);
  assert.match(garageStatus(initial, 'reinforced'), /not in the deployed inventory/i);
  const funded = { ...initial, credits: SWAP_CREDITS };
  const away = { ...funded, position: SITES.strata.cell };
  assertRejected(away, swapAtLander(away, 'wide'), /lander service area/i);
  assert.equal(garageStatus(funded, 'wide'), null);
  const swapped = swapAtLander(funded, 'wide');

  assert.equal(swapped.loadout.wheel, 'wide');
  assert.deepEqual(swapped.loadout.spares, ['light']);
  assert.deepEqual(funded.loadout, withSpare);
  assert.equal(swapped.credits, 0);
  assert.equal(swapped.elapsed, funded.elapsed + SWAP_MINUTES);
  assert.equal(swapped.battery, funded.battery);
  const after = payload(swapped.loadout);
  assert.equal(after.roverMass, before.roverMass + MODULES.wide.mass - MODULES.light.mass);
  assert.equal(after.spareMass, MODULES.light.mass);
  assert.equal(after.totalMass, before.totalMass);
  assert.equal(after.budget, before.budget);
});

test('a drive step past the survey deadline ends the mission and later inputs are inert', () => {
  const initial = getInitialState(FIRST, { ...DEFAULT_LOADOUT, spares: ['wide'] });
  const moving = stepDrive(initial, forward, DRIVE_STEP).state;
  const deadline = { ...moving, elapsed: MISSIONS[FIRST].limit };
  const ended = stepDrive(deadline, forward, DRIVE_STEP);
  assert.equal(ended.stopped, true);
  assert.equal(ended.distance, 0);
  assert.equal(ended.state.outcome, 'failure');
  assert.match(ended.state.reason, /survey window has closed/i);
  assert.equal(ended.state.pose.speed, 0);
  assert.deepEqual(ended.state.position, deadline.position);
  assert.equal(ended.state.elapsed, deadline.elapsed);
  assert.equal(ended.state.battery, deadline.battery);
  assert.deepEqual(stepDrive(ended.state, forward, DRIVE_STEP).state, ended.state);
  assert.deepEqual(performScienceAction(ended.state, recharge), ended.state);
  assert.match(garageStatus(ended.state, 'wide'), /survey has ended/i);
});
