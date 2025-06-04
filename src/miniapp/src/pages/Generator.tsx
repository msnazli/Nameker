import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import WebApp from '@twa-dev/sdk';
import { generateName } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const Generator: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    category: '',
    description: '',
    language: 'en'
  });

  const { mutate, isLoading, data, error } = useMutation(generateName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData);
  };

  React.useEffect(() => {
    if (error) {
      WebApp.showAlert(t('errors.generation'));
    }
  }, [error, t]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <Container className="mt-4">
      <Form id="generate-form" onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('generator.category')}</Form.Label>
          <Form.Select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
          >
            <option value="">{t('generator.selectCategory')}</option>
            <option value="business">{t('generator.categories.business')}</option>
            <option value="product">{t('generator.categories.product')}</option>
            <option value="brand">{t('generator.categories.brand')}</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('generator.description')}</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('generator.descriptionPlaceholder')}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('generator.language')}</Form.Label>
          <Form.Select
            value={formData.language}
            onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </Form.Select>
        </Form.Group>

        <Button type="submit" className="d-none">
          {t('generator.generate')}
        </Button>
      </Form>

      {data && (
        <div className="mt-4">
          <h3>{t('generator.results')}</h3>
          <ul className="list-unstyled">
            {data.names.map((name: string, index: number) => (
              <li key={index} className="mb-2">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
};

export default Generator; 