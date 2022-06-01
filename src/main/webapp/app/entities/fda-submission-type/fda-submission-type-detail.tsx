import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IFdaSubmissionTypeDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaSubmissionTypeDetail = (props: IFdaSubmissionTypeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaSubmissionTypeEntity = props.fdaSubmissionTypeEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fdaSubmissionTypeDetailsHeading">FDA Submission Type</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.name}</dd>
          <dt>
            <span id="shortName">Short Name</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.shortName}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.description}</dd>
        </dl>
        <Button tag={Link} to={`/fda-submission-type/${fdaSubmissionTypeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaSubmissionTypeStore }: IRootStore) => ({
  fdaSubmissionTypeEntity: fdaSubmissionTypeStore.entity,
  getEntity: fdaSubmissionTypeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmissionTypeDetail);
