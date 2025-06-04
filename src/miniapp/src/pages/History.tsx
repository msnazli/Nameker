import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Card, Button, Form, Badge, Alert as BootstrapAlert } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { BsStar, BsStarFill, BsTrash } from 'react-icons/bs';
import { getNames, updateName, deleteName } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const History: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: names, isLoading, error } = useQuery(
    ['names', { page, limit, category }],
    () => getNames({ page, limit, category }),
    {
      keepPreviousData: true
    }
  );

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: any }) => updateName(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('names');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: string) => deleteName(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('names');
      }
    }
  );

  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    updateMutation.mutate({
      id,
      updates: { isFavorite: !isFavorite }
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('history.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Container className="mt-4">
        <BootstrapAlert variant="danger">
          {t('errors.failedToLoadNames')}
        </BootstrapAlert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="mb-4">{t('history.title')}</h1>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>{t('history.filters.category')}</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t('history.filters.all')}</option>
              {names?.categories?.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {names?.names?.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <p className="mb-0">{t('history.empty')}</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {names?.names?.map((name: any) => (
            <Card key={name._id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h2 className="h5 mb-2">{name.name}</h2>
                    <p className="mb-2">{name.description}</p>
                    <small className="text-muted">
                      {new Date(name.createdAt).toLocaleDateString()}
                    </small>
                    <div className="mt-2">
                      {name.metadata.keywords?.map((keyword: string) => (
                        <Badge key={keyword} bg="secondary" className="me-1">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="link"
                      onClick={() => handleFavoriteToggle(name._id, name.isFavorite)}
                      className="p-0 me-2"
                    >
                      {name.isFavorite ? (
                        <BsStarFill className="text-warning" />
                      ) : (
                        <BsStar />
                      )}
                    </Button>
                    <Button
                      variant="link"
                      onClick={() => handleDelete(name._id)}
                      className="p-0 text-danger"
                    >
                      <BsTrash />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              variant="outline-primary"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              {t('common.previous')}
            </Button>
            <span>
              {t('common.page')} {page} / {Math.ceil((names?.total || 0) / limit)}
            </span>
            <Button
              variant="outline-primary"
              disabled={!names?.names?.length || names?.names?.length < limit}
              onClick={() => setPage(p => p + 1)}
            >
              {t('common.next')}
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default History; 