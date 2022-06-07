import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Badge, Button } from 'reactstrap';
import { JhiPagination, JhiItemCount, getSortState } from 'react-jhipster';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores/createStore';
import { IUser } from 'app/shared/model/user.model';
import { Column } from 'react-table';
import { TableHeader } from 'app/shared/table/TableHeader';
import EntityTable from 'app/shared/table/EntityTable';
import EntityActionButton from 'app/shared/button/EntityActionButton';

export interface IUserManagementProps extends StoreProps, RouteComponentProps {}

export const UserManagement = (props: IUserManagementProps) => {
  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const getUsersFromProps = () => {
    props.getUsersAsAdmin({
      page: pagination.activePage - 1,
      size: pagination.itemsPerPage,
      sort: `${pagination.sort},${pagination.order}`,
    });
    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    getUsersFromProps();
  }, [pagination.activePage, pagination.order, pagination.sort]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sortParam = params.get(SORT);
    if (page && sortParam) {
      const sortSplit = sortParam.split(',');
      setPagination({
        ...pagination,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = (fieldName: keyof IUser) => () =>
    setPagination({
      ...pagination,
      order: pagination.order === ASC ? DESC : ASC,
      sort: fieldName,
    });

  const handlePagination = currentPage =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const toggleActive = (user: IUser) => () => {
    props
      .updateUser({
        ...user,
        activated: !user.activated,
      })
      .then(() => getUsersFromProps());
  };

  const { users, match, totalItems, loading } = props;

  const columns: Column<IUser>[] = [
    {
      id: 'username',
      Header: <TableHeader header="User Name" onSort={sort('firstName')} paginationState={pagination} sortField="firstName" />,
      Cell: ({
        cell: {
          row: { original },
        },
      }) => `${original.firstName} ${original.lastName}`,
    },
    {
      accessor: 'email',
      Header: <TableHeader header="Email" onSort={sort('email')} paginationState={pagination} sortField="email" />,
    },
    {
      accessor: 'activated',
      Header: 'Activated',
      Cell: ({
        cell: {
          row: { original },
        },
      }) =>
        original.activated ? (
          <Button color="success" onClick={toggleActive(original)}>
            Activated
          </Button>
        ) : (
          <Button color="danger" onClick={toggleActive(original)}>
            Deactivated
          </Button>
        ),
    },
    {
      accessor: 'authorities',
      Header: <TableHeader header="Profiles" paginationState={pagination} />,
      Cell: ({
        cell: {
          row: { original },
        },
      }) =>
        original.authorities
          ? original.authorities.map((authority, i) => (
              <div key={`${original.login}-auth$-${i}`}>
                <Badge color="info">{authority}</Badge>
              </div>
            ))
          : null,
    },
  ];

  return (
    <div>
      <h2 id="user-management-page-heading">
        Users
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.USER} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>{users && <EntityTable columns={columns} data={users} loading={loading} url={match.url} entityType={ENTITY_TYPE.USER} />}</div>
      {totalItems && totalItems > 0 ? (
        <div>
          <Row className="justify-content-center">
            <JhiItemCount page={pagination.activePage} total={totalItems} itemsPerPage={pagination.itemsPerPage} i18nEnabled />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={pagination.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={pagination.itemsPerPage}
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

const mapStoreToProps = (storeState: IRootStore) => ({
  users: storeState.userStore.entities,
  totalItems: storeState.userStore.totalItems,
  account: storeState.authStore.account,
  getUsers: storeState.userStore.getEntities,
  loading: storeState.userStore.loading,
  updateUser: storeState.userStore.updateEntity,
  getUsersAsAdmin: storeState.userStore.getUsersAsAdmin,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(UserManagement);
