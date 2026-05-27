import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import AddCard from './pages/AddCard';
import EditCard from './pages/EditCard';
import MarketTools from './pages/MarketTools';
import Expenses from './pages/Expenses';
import AuthPage from './pages/AuthPage';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: 'var(--primary)',
            letterSpacing: '3px',
          }}
        >
          ⚡ POKETRACKER
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/add" element={<AddCard />} />
        <Route path="/edit" element={<EditCard />} />
        <Route path="/market" element={<MarketTools />} />
        <Route path="/expenses" element={<Expenses />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppContent />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
