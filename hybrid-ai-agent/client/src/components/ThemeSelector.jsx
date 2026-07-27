import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

const themeColors = {
  light:        ['#ffffff', '#374151', '#3b82f6'],
  dark:         ['#1a1a2e', '#e2e8f0', '#7c3aed'],
  emerald:      ['#ffffff', '#064e3b', '#10b981'],
  corporate:    ['#ffffff', '#1e293b', '#3b82f6'],
  cyberpunk:    ['#0a0a1a', '#faff00', '#ff00ff'],
  valentine:    ['#fce4ec', '#880e4f', '#e91e63'],
  halloween:    ['#1a1a1a', '#f97316', '#facc15'],
  garden:       ['#f0fdf4', '#166534', '#22c55e'],
  forest:       ['#1a2e1a', '#a3e635', '#65a30d'],
  lofi:         ['#ffffff', '#262626', '#a3a3a3'],
  pastel:       ['#fff5f5', '#4a5568', '#f687b3'],
  fantasy:      ['#ffffff', '#6b21a8', '#a855f7'],
  wireframe:    ['#ffffff', '#171717', '#525252'],
  luxury:       ['#0a0a0a', '#f5f5f4', '#d4af37'],
  dracula:      ['#282a36', '#f8f8f2', '#bd93f9'],
  cmyk:         ['#ffffff', '#1e1e1e', '#00bcd4'],
  autumn:       ['#fff8f0', '#5c3d2e', '#e67e22'],
  business:     ['#ffffff', '#0f172a', '#2563eb'],
  acid:         ['#ffffff', '#000000', '#a3e635'],
  lemonade:     ['#fffdf0', '#713f12', '#f59e0b'],
  night:        ['#0f172a', '#e2e8f0', '#818cf8'],
  coffee:       ['#fdf6ec', '#422006', '#d97706'],
  dim:          ['#1a1a2e', '#e0e0e0', '#64748b'],
  nord:         ['#2e3440', '#eceff4', '#88c0d0'],
  sunset:       ['#1a0a2e', '#fed7aa', '#f97316'],
};

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    onThemeChange(theme);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="btn btn-ghost btn-sm btn-circle"
        onClick={() => setOpen(!open)}
        title="Change theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 p-4 bg-base-100 border border-base-300 rounded-xl shadow-xl animate-fade-in">
            <p className="text-sm font-semibold mb-3">Select Theme</p>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(themeColors).map(([name, colors]) => (
                <button
                  key={name}
                  className="group relative flex flex-col items-center gap-1"
                  onClick={() => handleSelect(name)}
                  title={name}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      currentTheme === name
                        ? 'border-primary scale-110'
                        : 'border-base-300 hover:border-primary/50 hover:scale-105'
                    }`}
                    style={{ background: colors[0] }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: colors[2] }}
                    />
                    {currentTheme === name && (
                      <FiCheck
                        size={12}
                        className="absolute text-primary font-bold"
                        style={{ color: colors[2] === '#ffffff' ? '#000' : colors[2] }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-base-content/50 group-hover:text-base-content transition-colors truncate w-full text-center">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
