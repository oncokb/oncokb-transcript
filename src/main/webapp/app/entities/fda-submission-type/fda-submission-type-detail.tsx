import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
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
            <span id="submissionPrefix">Submission Prefix</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.submissionPrefix}</dd>
          <dt>
            <span id="submissionLink">Submission Link</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.submissionLink}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{fdaSubmissionTypeEntity.description}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={fdaSubmissionTypeEntity.id}
          entityType={ENTITY_TYPE.FDA_SUBMISSION_TYPE}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaSubmissionTypeStore }: IRootStore) => ({
  fdaSubmissionTypeEntity: fdaSubmissionTypeStore.entity,
  getEntity: fdaSubmissionTypeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IFdaSubmissionTypeDetailProps, StoreProps>(mapStoreToProps)(FdaSubmissionTypeDetail);
