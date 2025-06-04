import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  React.useEffect(() => {
    const mainButton = WebApp.MainButton;
    const backButton = WebApp.BackButton;

    const handleMainButtonClick = () => {
      if (location.pathname === '/') {
        const form = document.getElementById('generate-form') as HTMLFormElement;
        if (form) form.dispatchEvent(new Event('submit'));
      } else if (location.pathname === '/payment') {
        const form = document.getElementById('payment-form') as HTMLFormElement;
        if (form) form.dispatchEvent(new Event('submit'));
      }
    };

    if (location.pathname === '/') {
      mainButton.setText(t('common.generate'));
      mainButton.show();
      mainButton.onClick(handleMainButtonClick);
      backButton.hide();
    } else if (location.pathname === '/payment') {
      mainButton.setText(t('common.proceed'));
      mainButton.show();
      mainButton.onClick(handleMainButtonClick);
      backButton.show();
    } else {
      mainButton.hide();
      backButton.show();
    }

    return () => {
      mainButton.onClick(() => {});
    };
  }, [location.pathname, t]);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const bgColor = isDark ? 'dark' : 'light';
  const textColor = isDark ? 'light' : 'dark';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg={bgColor} variant={textColor} expand="lg" className="mb-3">
        <Container>
          <Navbar.Brand as={Link} to="/">
            {t('appName')}
          </Navbar.Brand>
          {user && (
            <>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/generator" active={location.pathname === '/generator'}>
                    {t('generator')}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/history" active={location.pathname === '/history'}>
                    {t('history')}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/payment" active={location.pathname === '/payment'}>
                    {t('credits')}: {user.credits}
                  </Nav.Link>
                </Nav>
                <Nav>
                  <Nav.Link as={Link} to="/settings" active={location.pathname === '/settings'}>
                    {t('settings')}
                  </Nav.Link>
                </Nav>
              </Navbar.Collapse>
            </>
          )}
        </Container>
      </Navbar>

      <Container className="flex-grow-1 mb-3">
        {children}
      </Container>

      <footer className="py-3 bg-light">
        <Container>
          <div className="text-center text-muted">
            <small>
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout; 