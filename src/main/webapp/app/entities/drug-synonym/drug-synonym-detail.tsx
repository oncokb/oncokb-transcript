import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IDrugSynonymDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugSynonymDetail = (props: IDrugSynonymDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugSynonymEntity = props.drugSynonymEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="drugSynonymDetailsHeading">DrugSynonym</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{drugSynonymEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{drugSynonymEntity.name}</dd>
          <dt>Drug</dt>
          <dd>{drugSynonymEntity.drug ? drugSynonymEntity.drug.id : ''}</dd>
        </dl>
        <Button tag={Link} to={`/drug-synonym/${drugSynonymEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ drugSynonymStore }: IRootStore) => ({
  drugSynonymEntity: drugSynonymStore.entity,
  getEntity: drugSynonymStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugSynonymDetail);
