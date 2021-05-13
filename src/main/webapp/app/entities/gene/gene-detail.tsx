import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './gene.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IGeneDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const GeneDetail = (props: IGeneDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { geneEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="geneDetailsHeading">Gene</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{geneEntity.id}</dd>
          <dt>
            <span id="entrezGeneId">Entrez Gene Id</span>
          </dt>
          <dd>{geneEntity.entrezGeneId}</dd>
          <dt>
            <span id="hugoSymbol">Hugo Symbol</span>
          </dt>
          <dd>{geneEntity.hugoSymbol}</dd>
        </dl>
        <Button tag={Link} to="/gene" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/gene/${geneEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ gene }: IRootState) => ({
  geneEntity: gene.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(GeneDetail);
