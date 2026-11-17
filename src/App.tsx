import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Home, Moon, Sun } from 'lucide-react';
import { OverviewHub, AppTabId } from './components/OverviewHub';
import PedVentModule from './modules/pedvent/PedVentModule';
import ZaribKaModule from './modules/zaribka/ZaribKaModule';
import PharmaPedModule from './modules/pharmaped/PharmaPedModule';
import NeedleStickModule from './modules/needlestick/NeedleStickModule';
import EDScoresModule from './modules/edscores/EDScoresModule';
import ToxicologyModule from './modules/toxicology/ToxicologyModule';
import BurnModule from './modules/burns/BurnModule';
import LibraryModule from './modules/library/LibraryModule';

const THEME_STORAGE_KEY = 'clinical_suite_theme';

const VALID_TABS: AppTabId[] = [
  'overview',
  'pedvent',
  'zaribka',
  'pharmaped',
  'needlestick',
  'edscores',
  'toxicology',
  'burns',
  'library',
];

function getInitialTab(): AppTabId {
  try {
    const hash = window.location.hash.replace('#', '') as AppTabId;
    if (VALID_TABS.includes(hash)) {
      return hash;
    }
  } catch {
    // Ignore hash access errors
  }
  return 'overview';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTabId>(getInitialTab);
  const [startupLoading, setStartupLoading] = useState(true);
  const [splashRemoved, setSplashRemoved] = useState(false);
  const [libraryReady, setLibraryReady] = useState(false);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return true;
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Project-wide splash screen timing: wait for library startup preload + minimum smooth splash visibility (capped at 4.5s)
  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinSplashElapsed(true), 550);
    const maxTimer = window.setTimeout(() => setStartupLoading(false), 4500);
    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, []);

  useEffect(() => {
    if (libraryReady && minSplashElapsed) {
      setStartupLoading(false);
    }
  }, [libraryReady, minSplashElapsed]);

  useEffect(() => {
    if (startupLoading || splashRemoved) return;
    const timer = window.setTimeout(() => setSplashRemoved(true), 220);
    return () => window.clearTimeout(timer);
  }, [startupLoading, splashRemoved]);

  const handleLibraryStartupReady = useCallback(() => {
    setLibraryReady(true);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const next = getInitialTab();
      setActiveTab(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelectTab = (tab: AppTabId) => {
    setActiveTab(tab);
    try {
      if (window.location.hash !== `#${tab}`) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    } catch {
      // Ignore history errors
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Project-wide Startup Splash Screen from library-app */}
      {!splashRemoved && (
        <div
          onTransitionEnd={() => setSplashRemoved(true)}
          className={`fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 text-center transition-opacity duration-200 ${
            startupLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-md">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">
            اپلیکیشن جامع اورژانس
          </h1>
          <div
            role="status"
            aria-label="در حال بارگذاری"
            className="mt-6 h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 dark:border-slate-800 border-t-teal-700"
          />
        </div>
      )}

      {/* Slim Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-11 flex items-center justify-between gap-4">
          {/* Top-Right (RTL Start): App Title */}
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className="text-sm sm:text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
          >
            اپلیکیشن جامع طب اورژانس
          </button>

          {/* Top-Left (RTL End): Compact Home Icon + Global Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {activeTab !== 'overview' && (
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                aria-label="صفحه اصلی"
                title="صفحه اصلی"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
              title={isDark ? 'حالت روشن' : 'حالت تاریک'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span className="hidden sm:inline">{isDark ? 'حالت روشن' : 'حالت تاریک'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Active Module Viewports (kept mounted to preserve user inputs/state across views) */}
      <div className="flex-1">
        <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
          <OverviewHub onSelectTab={handleSelectTab} />
        </div>
        <div className={activeTab === 'pedvent' ? 'block' : 'hidden'}>
          <PedVentModule />
        </div>
        <div className={activeTab === 'zaribka' ? 'block' : 'hidden'}>
          <ZaribKaModule />
        </div>
        <div className={activeTab === 'pharmaped' ? 'block' : 'hidden'}>
          <PharmaPedModule isDark={isDark} />
        </div>
        <div className={activeTab === 'needlestick' ? 'block' : 'hidden'}>
          <NeedleStickModule />
        </div>
        <div className={activeTab === 'edscores' ? 'block' : 'hidden'}>
          <EDScoresModule />
        </div>
        <div className={activeTab === 'toxicology' ? 'block' : 'hidden'}>
          <ToxicologyModule />
        </div>
        <div className={activeTab === 'burns' ? 'block' : 'hidden'}>
          <BurnModule />
        </div>
        <div className={activeTab === 'library' ? 'block' : 'hidden'}>
          <LibraryModule onStartupReady={handleLibraryStartupReady} />
        </div>
      </div>
    </div>
  );
}
