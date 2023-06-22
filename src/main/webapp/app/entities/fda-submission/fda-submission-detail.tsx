import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { TextFormat } from 'react-jhipster';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IFdaSubmissionDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionDetail = (props: IFdaSubmissionDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaSubmissionEntity = props.fdaSubmissionEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fdaSubmissionDetailsHeading">FDA Submission</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fdaSubmissionEntity.id}</dd>
          <dt>
            <span id="number">Number</span>
          </dt>
          <dd>{fdaSubmissionEntity.number}</dd>
          <dt>
            <span id="supplementNumber">Supplement Number</span>
          </dt>
          <dd>{fdaSubmissionEntity.supplementNumber}</dd>
          <dt>
            <span id="deviceName">Device Name</span>
          </dt>
          <dd>{fdaSubmissionEntity.deviceName}</dd>
          <dt>
            <span id="genericName">Generic Name</span>
          </dt>
          <dd>{fdaSubmissionEntity.genericName}</dd>
          <dt>
            <span id="dateReceived">Date Received</span>
          </dt>
          <dd>
            {fdaSubmissionEntity.dateReceived ? (
              <TextFormat value={fdaSubmissionEntity.dateReceived} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="decisionDate">Decision Date</span>
          </dt>
          <dd>
            {fdaSubmissionEntity.decisionDate ? (
              <TextFormat value={fdaSubmissionEntity.decisionDate} type="date" format={APP_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{fdaSubmissionEntity.description}</dd>
          <dt>
            <span id="curated">Curated</span>
          </dt>
          <dd>{fdaSubmissionEntity.curated ? 'true' : 'false'}</dd>
          <dt>
            <span id="genetic">Genetic</span>
          </dt>
          <dd>{fdaSubmissionEntity.genetic ? 'true' : 'false'}</dd>
          <dt>Companion Diagnostic Device</dt>
          <dd>{fdaSubmissionEntity.companionDiagnosticDevice ? fdaSubmissionEntity.companionDiagnosticDevice.name : ''}</dd>
          <dt>Type</dt>
          <dd>{fdaSubmissionEntity.type ? fdaSubmissionEntity.type?.shortName : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={fdaSubmissionEntity.id}
          entityType={ENTITY_TYPE.FDA_SUBMISSION}
          entityAction={ENTITY_ACTION.EDIT}
        />
        {!props.showCurationPanel && (
          <EntityActionButton
            color="primary"
            className="ml-2"
            entityId={fdaSubmissionEntity.id}
            entityType={ENTITY_TYPE.FDA_SUBMISSION}
            entityAction={ENTITY_ACTION.CURATE}
          />
        )}
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore, layoutStore }: IRootStore) => ({
  fdaSubmissionEntity: fdaSubmissionStore.entity,
  getEntity: fdaSubmissionStore.getEntity,
  showCurationPanel: layoutStore.showCurationPanel,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionDetail);
