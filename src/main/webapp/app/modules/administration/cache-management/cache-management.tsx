import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { notifyError, notifySuccess } from 'app/oncokb-commons/components/util/NotificationUtils';
import { elasticSearchClient } from 'app/shared/api/clients';
import FormSection from 'app/shared/form/FormSection';
import { ValidatedSelect } from 'app/shared/form/ValidatedField';
import { ValidatedForm } from 'app/shared/form/ValidatedForm';
import RouterPrompt from 'app/shared/prompt/RouterPrompt';
import { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Col, Row } from 'reactstrap';

enum ELASTICSEARCH_INDEX_NAME {
  ARTICLE = 'article',
  COMPANION_DIAGNOSTIC_DEVICE = 'companiondiagnosticdevice',
  FDA_SUBMISSION = 'fdasubmission',
  CANCER_TYPE = 'cancertype',
  DRUG = 'drug',
  GENE = 'gene',
  ALTERATION = 'alteration',
}

const indexNameOptions = Object.keys(ELASTICSEARCH_INDEX_NAME).map(key => ({ label: key, value: ELASTICSEARCH_INDEX_NAME[key] }));

const routerPromptMessage = (
  <>
    <div className="mb-2">Are you sure you want to leave before the application is finished caching all search data?</div>
    <Alert color="warning">Leaving before task is finished may cause the search to not work properly.</Alert>
  </>
);

const ElasticSearchManagement: React.FunctionComponent = () => {
  const [isReindexing, setIsReindexing] = useState(false);

  const onReindexSubmit = values => {
    setIsReindexing(true);
    const indexNames = values?.elasticsearchIndexNames?.map(names => names.value);
    onReindexComplete(elasticSearchClient.reindexIndicesFromList(indexNames));
  };

  const onReindexAll = () => {
    setIsReindexing(true);
    onReindexComplete(elasticSearchClient.reindexAll());
  };

  const onReindexComplete = (promise: Promise<AxiosResponse>) => {
    Promise.resolve(promise)
      .then(() => {
        notifySuccess('Recache complete');
        setIsReindexing(false);
      })
      .catch(error => {
        notifyError(error);
        setIsReindexing(false);
      });
  };

  return (
    <>
      <RouterPrompt when={isReindexing} message={routerPromptMessage} />
      <Row className="justify-content-center">
        <Col md="8">
          <h2>Cache Management</h2>
          <div className="mt-2">
            <ValidatedForm onSubmit={onReindexSubmit}>
              <FormSection>
                <ValidatedSelect
                  name="elasticsearchIndexNames"
                  isMulti
                  options={indexNameOptions}
                  placeholder="Select entities..."
                  isClearable
                  closeMenuOnSelect={false}
                  label="Recache search data"
                  validate={{ required: { value: true, message: 'This field is required' } }}
                />
                <div style={{ display: 'flex' }}>
                  <Button color="primary" type="submit" disabled={isReindexing}>
                    <span>Recache Selected Entities</span>
                    <LoadingIndicator isLoading={isReindexing} />
                  </Button>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '0 20px',
                    }}
                    className="font-weight-bold"
                  >
                    or
                  </div>
                  <Button color="primary" type="button" disabled={isReindexing} onClick={onReindexAll}>
                    <span>Recache All</span>
                    <LoadingIndicator isLoading={isReindexing} />
                  </Button>
                </div>
              </FormSection>
            </ValidatedForm>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ElasticSearchManagement;
