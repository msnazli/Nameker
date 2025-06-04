import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import WebApp from '@twa-dev/sdk';
import { createPayment } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const Payment: React.FC = () => {
  const { t } = useTranslation();

  const { mutate, isLoading } = useMutation(createPayment, {
    onSuccess: (data) => {
      if (data.paymentUrl) {
        WebApp.openLink(data.paymentUrl);
      }
    }
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>{t('payment.title')}</Card.Header>
        <Card.Body>
          <Card.Title>{t('payment.choosePlan')}</Card.Title>
          <div className="d-grid gap-3">
            <Button
              variant="outline-primary"
              onClick={() => mutate({ credits: 10, amount: 10 })}
            >
              {t('payment.basic')}
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => mutate({ credits: 50, amount: 45 })}
            >
              {t('payment.premium')}
            </Button>
            <Button
              variant="outline-primary"
              onClick={() => mutate({ credits: 100, amount: 80 })}
            >
              {t('payment.pro')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Payment; 