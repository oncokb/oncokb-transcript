import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { Association } from 'app/shared/api/generated';

export interface IGenomicIndicatorDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const GenomicIndicatorDetail = (props: IGenomicIndicatorDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const genomicIndicatorEntity = props.genomicIndicatorEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="genomicIndicatorDetailsHeading">GenomicIndicator</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{genomicIndicatorEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{genomicIndicatorEntity.type}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{genomicIndicatorEntity.name}</dd>
          <dt>Associated Allele States</dt>
          <dd>
            <span>{genomicIndicatorEntity.alleleStates?.map(alleleState => alleleState.name).join() || 'NA'}</span>
          </dd>
          <dt>Associated Alterations</dt>
          <dd>
            <span>
              {genomicIndicatorEntity.associations
                ?.map(association =>
                  association.alterations?.map(alt => `${alt.genes?.map(gene => gene.hugoSymbol).join('-')} ${alt.alteration}`).join()
                )
                .join() || 'NA'}
            </span>
          </dd>
        </dl>
        <EntityActionButton
          color="primary"
          entityId={genomicIndicatorEntity.id}
          entityType={ENTITY_TYPE.GENOMIC_INDICATOR}
          entityAction={ENTITY_ACTION.EDIT}
        />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ genomicIndicatorStore }: IRootStore) => ({
  genomicIndicatorEntity: genomicIndicatorStore.entity,
  getEntity: genomicIndicatorStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GenomicIndicatorDetail);
