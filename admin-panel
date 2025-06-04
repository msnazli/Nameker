import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import useTelegramWebApp from './hooks/useTelegramWebApp';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isReady, webApp, colorScheme } = useTelegramWebApp();

  useEffect(() => {
    if (webApp) {
      // Enable closing confirmation for better UX
      webApp.enableClosingConfirmation();
      
      // Set theme based on Telegram's color scheme
      webApp.setHeaderColor(colorScheme === 'dark' ? '#1a1a1a' : '#ffffff');
      webApp.setBackgroundColor(colorScheme === 'dark' ? '#2b2b2b' : '#ffffff');
    }
  }, [webApp, colorScheme]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App; 