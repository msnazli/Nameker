import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { BsLightningCharge, BsGlobe, BsAward, BsSpeedometer } from 'react-icons/bs';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';

function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Redirect to generator if user is logged in
  if (user) {
    return <Navigate to="/generator" replace />;
  }

  const features = [
    {
      icon: <BsLightningCharge size={24} />,
      title: t('home.features.ai'),
      description: t('home.features.ai')
    },
    {
      icon: <BsGlobe size={24} />,
      title: t('home.features.multilingual'),
      description: t('home.features.multilingual')
    },
    {
      icon: <BsAward size={24} />,
      title: t('home.features.professional'),
      description: t('home.features.professional')
    },
    {
      icon: <BsSpeedometer size={24} />,
      title: t('home.features.fast'),
      description: t('home.features.fast')
    }
  ];

  return (
    <Container>
      <Row className="text-center py-5">
        <Col>
          <h1 className="display-4 mb-3">{t('home.title')}</h1>
          <p className="lead mb-5">{t('home.subtitle')}</p>
        </Col>
      </Row>

      <Row className="justify-content-center mb-5">
        <Col xs={12}>
          <h2 className="text-center mb-4">{t('home.features.title')}</h2>
        </Col>
        {features.map((feature, index) => (
          <Col key={index} xs={12} sm={6} lg={3} className="mb-4">
            <Card className="h-100 text-center">
              <Card.Body>
                <div className="mb-3 text-primary">
                  {feature.icon}
                </div>
                <Card.Title>{feature.title}</Card.Title>
                <Card.Text>{feature.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Home; 