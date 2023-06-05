import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { TableHeader } from 'app/shared/table/TableHeader';
import _ from 'lodash';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityTable from 'app/shared/table/EntityTable';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
export interface IFdaSubmissionProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const FdaSubmission = (props: IFdaSubmissionProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(
      getSortState(props.location, ITEMS_PER_PAGE, DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.FDA_SUBMISSION]),
      props.location.search
    )
  );

  const fdaSubmissionList = props.fdaSubmissionList;
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

  const handleSearch = (event: any) => setSearch(event.target.value);

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

  const sort = (fieldName: keyof IFdaSubmission) => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: fieldName,
    });
  };

  const handlePagination = (currentPage: number) =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const { match } = props;

  const columns: Column<IFdaSubmission>[] = [
    {
      accessor: 'deviceName',
      Header: <TableHeader header="Device Name" onSort={sort('deviceName')} paginationState={paginationState} sortField="deviceName" />,
      width: 200,
      maxWidth: 300,
    },
    {
      accessor: 'number',
      Header: <TableHeader header="Number" onSort={sort('number')} paginationState={paginationState} sortField="number" />,
      maxWidth: 100,
    },
    {
      accessor: 'supplementNumber',
      Header: (
        <TableHeader
          header="Supplement Number"
          onSort={sort('supplementNumber')}
          paginationState={paginationState}
          sortField="supplementNumber"
        />
      ),
      maxWidth: 100,
    },
    {
      accessor: 'genetic',
      Header: <TableHeader header="Genetic Relevant" onSort={sort('genetic')} paginationState={paginationState} sortField="genetic" />,
      Cell: ({ cell: { value } }) => (value ? <FontAwesomeIcon icon={faCheck} /> : null),
      maxWidth: 50,
    },
    {
      accessor: 'curated',
      Header: <TableHeader header="Curated" onSort={sort('curated')} paginationState={paginationState} sortField="curated" />,
      Cell: ({ cell: { value } }) => (value ? <FontAwesomeIcon icon={faCheck} /> : null),
      maxWidth: 50,
    },
    {
      accessor: 'type',
      Header: <TableHeader header="Type" onSort={sort('type')} paginationState={paginationState} sortField="type" />,
      Cell: ({ cell: { value } }) => (value.shortName ? <Link to={`fda-submission-type/${value.id}`}>{value.shortName}</Link> : ''),
      maxWidth: 50,
    },
  ];

  return (
    <div>
      <h2 id="fda-submission-heading" data-cy="FdaSubmissionHeading">
        FDA Submissions
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.FDA_SUBMISSION} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>
        {fdaSubmissionList && (
          <EntityTable
            columns={columns}
            data={fdaSubmissionList}
            loading={loading}
            url={match.url}
            curatable
            entityType={ENTITY_TYPE.FDA_SUBMISSION}
          />
        )}
      </div>
      {totalItems && totalItems > 0 ? (
        <div>
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
      ) : null}
    </div>
  );
};

const mapStoreToProps = ({ fdaSubmissionStore }: IRootStore) => ({
  fdaSubmissionList: fdaSubmissionStore.entities,
  loading: fdaSubmissionStore.loading,
  totalItems: fdaSubmissionStore.totalItems,
  getEntities: fdaSubmissionStore.getEntities,
  searchEntities: fdaSubmissionStore.searchEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(FdaSubmission);
