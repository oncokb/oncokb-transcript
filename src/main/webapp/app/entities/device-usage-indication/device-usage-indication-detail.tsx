import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IDeviceUsageIndicationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DeviceUsageIndicationDetail = (props: IDeviceUsageIndicationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const deviceUsageIndicationEntity = props.deviceUsageIndicationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="deviceUsageIndicationDetailsHeading">DeviceUsageIndication</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{deviceUsageIndicationEntity.id}</dd>
          <dt>Fda Submission</dt>
          <dd>{deviceUsageIndicationEntity.fdaSubmission ? deviceUsageIndicationEntity.fdaSubmission.id : ''}</dd>
          <dt>Alterations</dt>
          <dd>
            {deviceUsageIndicationEntity.alterations
              ? deviceUsageIndicationEntity.alterations.map((val, i) => (
                  <span key={val.id}>
                    <Link to={`/alteration/${val.id}`}>{val.name}</Link>
                    {deviceUsageIndicationEntity.alterations && i === deviceUsageIndicationEntity.alterations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Cancer Type</dt>
          <dd>{deviceUsageIndicationEntity.cancerType ? deviceUsageIndicationEntity.cancerType.id : ''}</dd>
          <dt>Drugs</dt>
          <dd>
            {deviceUsageIndicationEntity.drugs
              ? deviceUsageIndicationEntity.drugs.map((val, i) => (
                  <span key={val.id}>
                    <Link to={`/drug/${val.id}`}>{val.name}</Link>
                    {deviceUsageIndicationEntity.drugs && i === deviceUsageIndicationEntity.drugs.length - 1 ? '' : ' + '}
                  </span>
                ))
              : null}
          </dd>
        </dl>
        <Button tag={Link} to={`/device-usage-indication/${deviceUsageIndicationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ deviceUsageIndicationStore }: IRootStore) => ({
  deviceUsageIndicationEntity: deviceUsageIndicationStore.entity,
  getEntity: deviceUsageIndicationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DeviceUsageIndicationDetail);
