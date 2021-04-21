import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { byteSize } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './drug.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IDrugDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const DrugDetail = (props: IDrugDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { drugEntity } = props;
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
            <span id="name">Name</span>
          </dt>
          <dd>{drugEntity.name}</dd>
          <dt>
            <span id="code">Code</span>
          </dt>
          <dd>{drugEntity.code}</dd>
          <dt>
            <span id="semanticType">Semantic Type</span>
          </dt>
          <dd>{drugEntity.semanticType}</dd>
        </dl>
        <Button tag={Link} to="/drug" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/drug/${drugEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ drug }: IRootState) => ({
  drugEntity: drug.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(DrugDetail);
