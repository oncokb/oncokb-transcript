import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { IRootStore } from 'app/stores';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import SynonymBadge from 'app/shared/badge/SynonymBadge';

export interface IDrugDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugDetail = (props: IDrugDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const drugEntity = props.drugEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="drugDetailsHeading">Drug</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{drugEntity.id}</dd>
          <dt>
            <span id="uuid">UUID</span>
          </dt>
          <dd>{drugEntity.uuid}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{drugEntity.name}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{drugEntity.nciThesaurus?.code}</dd>
          <dt>Flag</dt>
          <dd>
            {drugEntity.flags
              ? drugEntity.flags.map((val, i) => (
                  <span key={val.id}>
                    <a>{val.id}</a>
                    {drugEntity.flags && i === drugEntity.flags.length - 1 ? '' : ', '}
                  </span>
                ))
              : null}
          </dd>
          <dt>
            <span id="brandNames">Also known as</span>
          </dt>
          <dd>
            {drugEntity.nciThesaurus?.synonyms.map((synonym, index) => (
              <SynonymBadge synonym={synonym} key={index} />
            ))}
          </dd>
        </dl>
        <EntityActionButton color="primary" entityId={drugEntity.id} entityType={ENTITY_TYPE.DRUG} entityAction={ENTITY_ACTION.EDIT} />
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ drugStore }: IRootStore) => ({
  drugEntity: drugStore.entity,
  getEntity: drugStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(DrugDetail);
