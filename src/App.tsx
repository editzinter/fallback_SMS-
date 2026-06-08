import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { useThemeStore } from './store/useStore';
import { useEffect } from 'react';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);

      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/:id" element={<Workspace />} />
      </Routes>
    </Router>
  );
}

export default App;
