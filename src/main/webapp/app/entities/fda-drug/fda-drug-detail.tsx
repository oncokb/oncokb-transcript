import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYP } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IFdaDrugDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FdaDrugDetail = (props: IFdaDrugDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const fdaDrugEntity = props.fdaDrugEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="fdaDrugDetailsHeading">FdaDrug</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{fdaDrugEntity.id}</dd>
          <dt>
            <span id="applicationNumber">Application Number</span>
          </dt>
          <dd>{fdaDrugEntity.applicationNumber}</dd>
          <dt>Drug</dt>
          <dd>{fdaDrugEntity.drug ? fdaDrugEntity.drug.name : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={fdaDrugEntity.id}
          entityType={ENTITY_TYPE.FDA_DRUG}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ fdaDrugStore }: IRootStore) => ({
  fdaDrugEntity: fdaDrugStore.entity,
  getEntity: fdaDrugStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaDrugDetail);
