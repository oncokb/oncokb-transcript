import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';

import { IRootStore } from 'app/stores';
export interface IEnsemblGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const EnsemblGene = (props: IEnsemblGeneProps) => {
  const ensemblGeneList = props.ensemblGeneList;
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
      <h2 id="ensembl-gene-heading" data-cy="EnsemblGeneHeading">
        Ensembl Genes
        <div className="d-flex justify-content-end">
          <Button className="mr-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
          </Button>
          <Link to={`${match.url}/new`} className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create new Ensembl Gene
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {ensemblGeneList && ensemblGeneList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference Genome</th>
                <th>Ensembl Gene Id</th>
                <th>Canonical</th>
                <th>Chromosome</th>
                <th>Start</th>
                <th>End</th>
                <th>Strand</th>
                <th>Gene</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ensemblGeneList.map((ensemblGene, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`${match.url}/${ensemblGene.id}`} color="link" size="sm">
                      {ensemblGene.id}
                    </Button>
                  </td>
                  <td>{ensemblGene.referenceGenome}</td>
                  <td>{ensemblGene.ensemblGeneId}</td>
                  <td>{ensemblGene.canonical ? 'true' : 'false'}</td>
                  <td>{ensemblGene.chromosome}</td>
                  <td>{ensemblGene.start}</td>
                  <td>{ensemblGene.end}</td>
                  <td>{ensemblGene.strand}</td>
                  <td>{ensemblGene.gene ? <Link to={`gene/${ensemblGene.gene.id}`}>{ensemblGene.gene.id}</Link> : ''}</td>
                  <td className="text-right">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`${match.url}/${ensemblGene.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${ensemblGene.id}/edit`} color="primary" size="sm" data-cy="entityEditButton">
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button tag={Link} to={`${match.url}/${ensemblGene.id}/delete`} color="danger" size="sm" data-cy="entityDeleteButton">
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Ensembl Genes found</div>
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  ensemblGeneList: ensemblGeneStore.entities,
  loading: ensemblGeneStore.loading,
  getEntities: ensemblGeneStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGene);
