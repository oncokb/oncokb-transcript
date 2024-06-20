import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IEligibilityCriteriaDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const EligibilityCriteriaDetail = (props: IEligibilityCriteriaDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const eligibilityCriteriaEntity = props.eligibilityCriteriaEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="eligibilityCriteriaDetailsHeading">EligibilityCriteria</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.type}</dd>
          <dt>
            <span id="priority">Priority</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.priority}</dd>
          <dt>
            <span id="criteria">Criteria</span>
          </dt>
          <dd>{eligibilityCriteriaEntity.criteria}</dd>
          <dt>Association</dt>
          <dd>
            {eligibilityCriteriaEntity.associations
              ? eligibilityCriteriaEntity.associations.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {eligibilityCriteriaEntity.associations && i === eligibilityCriteriaEntity.associations.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Clinical Trial</dt>
          <dd>{eligibilityCriteriaEntity.clinicalTrial ? eligibilityCriteriaEntity.clinicalTrial.id : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={eligibilityCriteriaEntity.id}
          entityType={ENTITY_TYPE.ELIGIBILITY_CRITERIA}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ eligibilityCriteriaStore }: IRootStore) => ({
  eligibilityCriteriaEntity: eligibilityCriteriaStore.entity,
  getEntity: eligibilityCriteriaStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IEligibilityCriteriaDetailProps, StoreProps>(mapStoreToProps)(EligibilityCriteriaDetail);
