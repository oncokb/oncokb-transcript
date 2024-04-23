import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { getGeneName } from 'app/shared/util/utils';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IFlagDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const FlagDetail = (props: IFlagDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);
  useEffect(() => {
    if (props.flagEntity.type === 'GENE') {
      props.getOncokbEntity();
    }
  }, [props.flagEntity.type]);

  const flagEntity = props.flagEntity;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const oncokbIds = props.oncokbGeneFlagEntity?.genes.map(oncokbGene => oncokbGene.id) || [];
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="flagDetailsHeading">Flag</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{flagEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{flagEntity.type}</dd>
          <dt>
            <span id="flag">Flag</span>
          </dt>
          <dd>{flagEntity.flag}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{flagEntity.name}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{flagEntity.description}</dd>
          <dt>
            <span id="lastModified">Associated Genes</span>
          </dt>
          <dd>
            {(flagEntity.genes || []).map(gene => {
              const badgeClassName = oncokbIds.includes(gene.id) ? 'badge-info' : 'badge-warning';
              return (
                <span key={gene.id} className={`badge badge-pill ${badgeClassName} mr-1`}>
                  {getGeneName(gene)}
                </span>
              );
            })}
          </dd>
        </dl>
        <EntityActionButton color="primary" entityId={flagEntity.id} entityType={ENTITY_TYPE.FLAG} entityAction={ENTITY_ACTION.EDIT} />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ flagStore }: IRootStore) => ({
  flagEntity: flagStore.entity,
  oncokbGeneFlagEntity: flagStore.oncokbGeneEntity,
  getEntity: flagStore.getEntity,
  getOncokbEntity: flagStore.getOncokbEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FlagDetail);
