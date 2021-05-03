import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IRootState } from 'app/shared/reducers';
import { getEntity } from './gene-alias.reducer';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

export interface IGeneAliasDetailProps extends StateProps, DispatchProps, RouteComponentProps<{ id: string }> {}

export const GeneAliasDetail = (props: IGeneAliasDetailProps) => {
  useEffect(() => {
    props.getEntity(props.match.params.id);
  }, []);

  const { geneAliasEntity } = props;
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="geneAliasDetailsHeading">GeneAlias</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{geneAliasEntity.id}</dd>
          <dt>
            <span id="name">Name</span>
          </dt>
          <dd>{geneAliasEntity.name}</dd>
          <dt>Gene</dt>
          <dd>{geneAliasEntity.gene ? geneAliasEntity.gene.id : ''}</dd>
        </dl>
        <Button tag={Link} to="/gene-alias" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/gene-alias/${geneAliasEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = ({ geneAlias }: IRootState) => ({
  geneAliasEntity: geneAlias.entity,
});

const mapDispatchToProps = { getEntity };

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(GeneAliasDetail);
