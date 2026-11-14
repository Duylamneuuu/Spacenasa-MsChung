import { Component, lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './ExpeditionUI';
import './TitleScreen.css';

const TitleMars = lazy(() => import('../scene/TitleMars').then(({ TitleMars }) => ({ default: TitleMars })));

class GlobeFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) onStart(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);
  return <div className="ts-root">
    <div className="ts-stars" aria-hidden="true" />
    <div className="ts-planet" aria-hidden="true">
      <div className="ts-planet-fallback" />
      <GlobeFallback><Suspense fallback={null}><TitleMars /></Suspense></GlobeFallback>
      <div className="ts-rim" />
    </div>
    <div className="ts-bars" aria-hidden="true"><i /><i /></div>
    <header className="ts-top"><span>MS CHUNG</span><span>NASA SPACE APPS CHALLENGE 2026</span></header>
    <section className="ts-copy" aria-labelledby="ts-title">
      <p className="ts-kicker">A Mars rover expedition</p>
      <h1 id="ts-title">APOGEE</h1>
      <h2>Mars Rover Architect</h2>
      <p className="ts-desc">Build a rover on Earth. Plot a route across Martian terrain. Then take the wheel and bring the science home.</p>
      <button className="ts-start" onClick={onStart} autoFocus>Start expedition <Icon name="arrow" /></button>
      <p className="ts-press">Press <kbd>Enter</kbd> to begin · Drag the planet to rotate</p>
    </section>
    <footer className="ts-foot"><span>01 · First Survey</span><span>02 · The Dune Crossing</span></footer>
  </div>;
}

