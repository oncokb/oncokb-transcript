import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';

import { IClinicalTrialsGovCondition } from 'app/shared/model/clinical-trials-gov-condition.model';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';

import { IRootStore } from 'app/stores';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import EntityTable from 'app/shared/table/EntityTable';
import { TableHeader } from 'app/shared/table/TableHeader';
import { Column } from 'react-table';

export interface IClinicalTrialsGovConditionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const ClinicalTrialsGovCondition = (props: IClinicalTrialsGovConditionProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const clinicalTrialsGovConditionList = props.clinicalTrialsGovConditionList;
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

  const handleSearch = event => setSearch(event.target.value);

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

  const { match } = props;

  const columns: Column<IClinicalTrialsGovCondition>[] = [
    {
      accessor: 'name',
      Header: <TableHeader header="Name" onSort={sort('name')} paginationState={paginationState} sortField="name" />,
    },
  ];

  return (
    <div>
      <h2 id="clinical-trials-gov-condition-heading" data-cy="ClinicalTrialsGovConditionHeading">
        CT.gov Conditions
        <EntityActionButton
          className="ml-2"
          color="primary"
          entityType={ENTITY_TYPE.CT_GOV_CONDITION}
          entityAction={ENTITY_ACTION.CREATE}
        />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div className="table-responsive">
        {clinicalTrialsGovConditionList && (
          <EntityTable
            columns={columns}
            data={clinicalTrialsGovConditionList}
            loading={loading}
            url={match.url}
            entityType={ENTITY_TYPE.CT_GOV_CONDITION}
          />
        )}
      </div>
      {totalItems ? (
        <div className={clinicalTrialsGovConditionList && clinicalTrialsGovConditionList.length > 0 ? '' : 'd-none'}>
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

const mapStoreToProps = ({ clinicalTrialsGovConditionStore }: IRootStore) => ({
  clinicalTrialsGovConditionList: clinicalTrialsGovConditionStore.entities,
  loading: clinicalTrialsGovConditionStore.loading,
  totalItems: clinicalTrialsGovConditionStore.totalItems,
  searchEntities: clinicalTrialsGovConditionStore.searchEntities,
  getEntities: clinicalTrialsGovConditionStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(ClinicalTrialsGovCondition);
