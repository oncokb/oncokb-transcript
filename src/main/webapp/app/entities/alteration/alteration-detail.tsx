import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
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
          <dt>Reference Genome</dt>
          <dd>{alterationEntity.referenceGenomes?.map(rg => rg.referenceGenome).join(', ')}</dd>
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
          <dd>
            {alterationEntity.genes
              ? alterationEntity.genes.map((val, i) => (
                  <span key={val.id}>
                    <Link to={`/gene/${val.id}`}>{val.hugoSymbol}</Link>
                    {alterationEntity.genes && i === alterationEntity.genes.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>Consequence</dt>
          <dd>{alterationEntity.consequence ? alterationEntity.consequence.id : ''}</dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={alterationEntity.id}
          entityType={ENTITY_TYPE.GENE}
          entityAction={ENTITY_ACTION.EDIT}
        />
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
