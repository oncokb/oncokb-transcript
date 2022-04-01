import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IGeneAlias } from 'app/shared/model/gene-alias.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IGeneAliasProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const GeneAlias = (props: IGeneAliasProps) => {
  const geneAliasList = props.geneAliasList;
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
      <h2 id="gene-alias-heading" data-cy="GeneAliasHeading">
        Gene Aliases
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Gene Alias
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {geneAliasList && geneAliasList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gene</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {geneAliasList.map((geneAlias, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${geneAlias.id}`} color="link" size="sm">
                      {geneAlias.id}
                    </Button>
                  </td>
                  <td>{geneAlias.name}</td>
                  <td>{geneAlias.gene ? <Link to={`gene/${geneAlias.gene.id}`}>{geneAlias.gene.id}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${geneAlias.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${geneAlias.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${geneAlias.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Gene Aliases found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ geneAliasStore }: IRootStore) => ({
  geneAliasList: geneAliasStore.entities,
  loading: geneAliasStore.loading,
  getEntities: geneAliasStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(GeneAlias);
