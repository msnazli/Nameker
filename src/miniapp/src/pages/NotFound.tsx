import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container className="text-center mt-5">
      <h1>404</h1>
      <p>{t('errors.pageNotFound')}</p>
      <Link to="/" className="btn btn-primary">
        {t('common.backToHome')}
      </Link>
    </Container>
  );
};

export default NotFound; 