import { Component, lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Icon, LangSwitch } from './ExpeditionUI';
import './TitleScreen.css';

const TitleMars = lazy(() => import('../scene/TitleMars').then(({ TitleMars }) => ({ default: TitleMars })));

class GlobeFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
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
    <header className="ts-top"><span>MS CHUNG · NASA SPACE APPS 2026</span><LangSwitch /></header>
    <section className="ts-copy" aria-labelledby="ts-title">
      <p className="ts-kicker">{t('title.kicker')}</p>
      <h1 id="ts-title">APOGEE</h1>
      <h2>{t('title.subtitle')}</h2>
      <p className="ts-desc">{t('title.desc')}</p>
      <button className="ts-start" onClick={onStart} autoFocus>{t('title.start')} <Icon name="arrow" /></button>
      <p className="ts-press">{t('title.press')} <kbd>Enter</kbd> {t('title.pressAfter')}</p>
    </section>
  </div>;
}

