import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Row, Table } from 'reactstrap';
import { Translate, getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
export interface IEnsemblGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const EnsemblGene = (props: IEnsemblGeneProps) => {
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const ensemblGeneList = props.ensemblGeneList;
  const loading = props.loading;
  const totalItems = props.totalItems;

  const getAllEntities = () => {
    props.getEntities({
      page: paginationState.activePage - 1,
      size: paginationState.itemsPerPage,
      sort: `${paginationState.sort},${paginationState.order}`,
    });
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
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
                <th className="hand" onClick={sort('id')}>
                  ID <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('referenceGenome')}>
                  Reference Genome <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('ensemblGeneId')}>
                  Ensembl Gene Id <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('canonical')}>
                  Canonical <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('chromosome')}>
                  Chromosome <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('start')}>
                  Start <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('end')}>
                  End <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('strand')}>
                  Strand <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  Gene <FontAwesomeIcon icon="sort" />
                </th>
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
                      <Button
                        tag={Link}
                        to={`${match.url}/${ensemblGene.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`${match.url}/${ensemblGene.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
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
      {totalItems ? (
        <div className={ensemblGeneList && ensemblGeneList.length > 0 ? '' : 'd-none'}>
          <Row className="justify-content-center">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </Row>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

const mapStoreToProps = ({ ensemblGeneStore }: IRootStore) => ({
  ensemblGeneList: ensemblGeneStore.entities,
  loading: ensemblGeneStore.loading,
  totalItems: ensemblGeneStore.totalItems,
  getEntities: ensemblGeneStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGene);
