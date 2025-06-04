import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Form, Card } from 'react-bootstrap';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface Settings {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { setTheme } = useTheme();

  const defaultSettings: Settings = {
    notifications: user?.settings?.notifications ?? false,
    theme: user?.settings?.theme ?? 'system'
  };

  const handleSettingsChange = async (newSettings: Partial<Settings>) => {
    if (!user) return;
    
    const updatedSettings: Settings = {
      ...defaultSettings,
      ...newSettings
    };

    try {
      await updateUser({ settings: updatedSettings });
      if (newSettings.theme) {
        setTheme(newSettings.theme);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>{t('settings.title')}</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('settings.language')}</Form.Label>
              <Form.Select
                value={i18n.language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="en">English</option>
                <option value="fa">فارسی</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('settings.theme')}</Form.Label>
              <Form.Select
                value={defaultSettings.theme}
                onChange={(e) => handleSettingsChange({ theme: e.target.value as Settings['theme'] })}
              >
                <option value="light">{t('settings.themes.light')}</option>
                <option value="dark">{t('settings.themes.dark')}</option>
                <option value="system">{t('settings.themes.system')}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="notifications"
                label={t('settings.notifications')}
                checked={defaultSettings.notifications}
                onChange={(e) => handleSettingsChange({ notifications: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings; 