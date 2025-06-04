import { useEffect, useState } from 'react';

// Import the mock only during development
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  require('../mocks/telegram-web-app');
}

export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if Telegram WebApp is available
    if (window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp);
      setIsReady(true);
    }
  }, []);

  return {
    webApp,
    isReady,
    user: webApp?.initDataUnsafe?.user,
    colorScheme: webApp?.colorScheme || 'light',
    platform: webApp?.platform || 'unknown',
  };
};

export default useTelegramWebApp; 