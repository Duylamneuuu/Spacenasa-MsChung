import type { MissionResources } from '../types/game';

// Duy owns src/ui. Values are mocked until Hải and Sơn connect real data.
export function ResourcesPanel({ resources }: { resources: MissionResources }) {
  return (
    <section className="panel">
      <h2>Mission resources <small>mock data</small></h2>
      <dl>
        <dt>Budget remaining</dt><dd>{resources.budgetRemaining}</dd>
        <dt>Mass</dt><dd>{resources.massKg} / {resources.massLimitKg} kg</dd>
        <dt>Power</dt><dd>{resources.powerRequiredW} / {resources.powerAvailableW} W</dd>
        <dt>Risk</dt><dd>{resources.risk} / 100</dd>
      </dl>
    </section>
  );
}
