import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IGene } from 'app/shared/model/gene.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Gene = (props: IGeneProps) => {
  const geneList = props.geneList;
  const loading = props.loading;

  useEffect(() => {
    props.getEntities({});
  }, []);

  const handleSyncList = () => {
    props.getEntities({});
  };

  const { match } = props;

  return (
    <div>
      <h2 id="gene-heading" data-cy="GeneHeading">
        Genes
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Gene
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {geneList && geneList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Entrez Gene Id</th>
                <th>Hugo Symbol</th>
                <th>Alteration</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {geneList.map((gene, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${gene.id}`} color="link" size="sm">
                      {gene.id}
                    </Button>
                  </td>
                  <td>{gene.entrezGeneId}</td>
                  <td>{gene.hugoSymbol}</td>
                  <td>
                    {gene.alterations
                      ? gene.alterations.map((val, j) => (
                          <span key={j}>
                            <Link to={`alteration/${val.id}`}>{val.id}</Link>
                            {j === gene.alterations.length - 1 ? '' : ', '}
                          </span>
                        ))
                      : null}
                  </td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${gene.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${gene.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${gene.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Genes found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ geneStore }: IRootStore) => ({
  geneList: geneStore.entities,
  loading: geneStore.loading,
  getEntities: geneStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Gene);
