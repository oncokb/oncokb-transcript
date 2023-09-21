import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Col, Input, Row, Table } from 'reactstrap';
import { Translate, getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IEnsemblGene } from 'app/shared/model/ensembl-gene.model';
import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { TableHeader } from 'app/shared/table/TableHeader';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import EntityTable from 'app/shared/table/EntityTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import { getGeneName, getGenomicLocation } from 'app/shared/util/utils';

export interface IEnsemblGeneProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const EnsemblGene = (props: IEnsemblGeneProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const ensemblGeneList = props.ensemblGeneList;
  const loading = props.loading;
  const totalItems = props.totalItems;

  const getAllEntities = () => {
    if (search) {
      debouncedSearchWithPagination(
        search,
        paginationState.activePage - 1,
        paginationState.itemsPerPage,
        `${paginationState.sort},${paginationState.order}`,
        props.searchEntities
      );
    } else {
      props.getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      });
    }
  };

  const handleSearch = (event: any) => {
    setSearch(event.target.value);
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
  }, [paginationState.activePage, paginationState.order, paginationState.sort, search]);

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

  const columns: Column<IEnsemblGene>[] = [
    {
      accessor: 'id',
      Header: <TableHeader header="ID" onSort={sort('id')} paginationState={paginationState} sortField="id" />,
      maxWidth: 60,
      minWidth: 60,
    },
    {
      accessor: 'ensemblGeneId',
      Header: (
        <TableHeader header="Ensembl Gene ID" onSort={sort('ensemblGeneId')} paginationState={paginationState} sortField="ensemblGeneId" />
      ),
      Cell: ({
        cell: {
          row: { original },
        },
      }) => (
        <div>
          {original.ensemblGeneId} ({original.referenceGenome})
        </div>
      ),
    },
    {
      accessor: 'canonical',
      Header: 'Canonical',
      Cell: ({ cell: { value } }) => `${value}`,
    },
    {
      id: 'segRegion',
      accessor: 'seqRegion',
      Header: 'Seg Region',
      Cell: ({ cell: { value } }) => value.name,
    },
    {
      id: 'location',
      Header: 'Location',
      Cell: ({
        cell: {
          row: { original },
        },
      }) => <div>{getGenomicLocation(original)}</div>,
    },
    {
      id: 'gene',
      Header: 'Gene',
      Cell: ({
        cell: {
          row: { original },
        },
      }) => <div>{getGeneName(original.gene)}</div>,
    },
  ];

  return (
    <div>
      <h2 id="ensembl-gene-heading" data-cy="EnsemblGeneHeading">
        Ensembl Genes
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.ENSEMBL_GENE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>
        {ensemblGeneList && (
          <EntityTable columns={columns} data={ensemblGeneList} loading={loading} url={match.url} entityType={ENTITY_TYPE.ENSEMBL_GENE} />
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
  searchEntities: ensemblGeneStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(EnsemblGene);
