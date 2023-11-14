import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants/constants';
export interface IAlterationReferenceGenomeDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationReferenceGenomeDetail = (props: IAlterationReferenceGenomeDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const alterationReferenceGenomeEntity = props.alterationReferenceGenomeEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="alterationReferenceGenomeDetailsHeading">AlterationReferenceGenome</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{alterationReferenceGenomeEntity.id}</dd>
          <dt>
            <span id="referenceGenome">Reference Genome</span>
          </dt>
          <dd>{alterationReferenceGenomeEntity.referenceGenome}</dd>
          <dt>Alteration</dt>
          <dd>{alterationReferenceGenomeEntity.alteration ? alterationReferenceGenomeEntity.alteration.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/alteration-reference-genome" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/alteration-reference-genome/${alterationReferenceGenomeEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ alterationReferenceGenomeStore }: IRootStore) => ({
  alterationReferenceGenomeEntity: alterationReferenceGenomeStore.entity,
  getEntity: alterationReferenceGenomeStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationReferenceGenomeDetail);
