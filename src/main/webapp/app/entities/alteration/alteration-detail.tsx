import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IAlterationDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationDetail = (props: IAlterationDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const alterationEntity = props.alterationEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="alterationDetailsHeading">Alteration</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{alterationEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{alterationEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{alterationEntity.name}</dd>
          <dt>
            <span id="alteration">Alteration</span>
          </dt>
          <dd>{alterationEntity.alteration}</dd>
          <dt>
            <span id="proteinStart">Protein Start</span>
          </dt>
          <dd>{alterationEntity.proteinStart}</dd>
          <dt>
            <span id="proteinEnd">Protein End</span>
          </dt>
          <dd>{alterationEntity.proteinEnd}</dd>
          <dt>
            <span id="refResidues">Ref Residues</span>
          </dt>
          <dd>{alterationEntity.refResidues}</dd>
          <dt>
            <span id="variantResidues">Variant Residues</span>
          </dt>
          <dd>{alterationEntity.variantResidues}</dd>
          <dt>Gene</dt>
          <dd>{alterationEntity.gene ? alterationEntity.gene.hugoSymbol : ''}</dd>
          <dt>Consequence</dt>
          <dd>{alterationEntity.consequence ? alterationEntity.consequence.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/alteration" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/alteration/${alterationEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ alterationStore }: IRootStore) => ({
  alterationEntity: alterationStore.entity,
  getEntity: alterationStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationDetail);
