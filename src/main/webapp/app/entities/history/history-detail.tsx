import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootStore } from 'app/stores';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
export interface IHistoryDetailProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const HistoryDetail = (props: IHistoryDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const historyEntity = props.historyEntity;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="historyDetailsHeading">History</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{historyEntity.id}</dd>
          <dt>
            <span id="type">Type</span>
          </dt>
          <dd>{historyEntity.type}</dd>
          <dt>
            <span id="updatedTime">Updated Time</span>
          </dt>
          <dd>
            {historyEntity.updatedTime ? <TextFormat value={historyEntity.updatedTime} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <span id="updatedBy">Updated By</span>
          </dt>
          <dd>{historyEntity.updatedBy}</dd>
          <dt>
            <span id="entityName">Entity Name</span>
          </dt>
          <dd>{historyEntity.entityName}</dd>
          <dt>
            <span id="entityId">Entity Id</span>
          </dt>
          <dd>{historyEntity.entityId}</dd>
        </dl>
        <Button tag={Link} to="/history" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/history/${historyEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStoreToProps = ({ historyStore }: IRootStore) => ({
  historyEntity: historyStore.entity,
  getEntity: historyStore.getEntity,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(HistoryDetail);
