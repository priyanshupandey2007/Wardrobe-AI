import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import WardrobePage from './pages/WardrobePage';
import OutfitsPage from './pages/OutfitsPage';
import WeeklyPlanPage from './pages/WeeklyPlanPage';
import Navbar from './components/Navbar';
import { supabase } from './lib/supabase';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [stats, setStats] = useState({ total: 0, outfits: 0 });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ count: itemCount }, { count: outfitCount }] = await Promise.all([
        supabase.from('clothing_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('outfits').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setStats({ total: itemCount || 0, outfits: outfitCount || 0 });
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-stone-500 dark:text-stone-400 text-sm">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} />;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <Navbar currentPage={page} onNavigate={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
      <main>
        {page === 'home' && <HomePage onNavigate={setPage} stats={stats} />}
        {page === 'wardrobe' && <WardrobePage />}
        {page === 'outfits' && <OutfitsPage />}
        {page === 'weekly' && <WeeklyPlanPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}