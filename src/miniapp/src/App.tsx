import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import WebApp from '@twa-dev/sdk';
import { useTranslation } from 'react-i18next';

// Components
import Layout from '@components/Layout';
import ProtectedRoute from '@components/ProtectedRoute';

// Pages
import Home from '@pages/Home';
import Generator from '@pages/Generator';
import History from '@pages/History';
import Payment from '@pages/Payment';
import Settings from '@pages/Settings';
import NotFound from '@pages/NotFound';

// Providers
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
});

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();

    // Set theme based on Telegram theme
    const colorScheme = WebApp.colorScheme;
    document.documentElement.setAttribute('data-bs-theme', colorScheme);

    // Set language based on user's Telegram language
    const userLanguage = WebApp.initDataUnsafe.user?.language_code;
    if (userLanguage && ['en', 'fa'].includes(userLanguage)) {
      i18n.changeLanguage(userLanguage);
      document.documentElement.dir = userLanguage === 'fa' ? 'rtl' : 'ltr';
    }
  }, [i18n]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/generator"
                  element={
                    <ProtectedRoute>
                      <Generator />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 