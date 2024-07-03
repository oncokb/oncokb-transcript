import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { IUser } from 'app/shared/model/user.model';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable, { SearchColumn } from 'app/shared/table/OncoKBTable';
import { filterByKeyword, getEntityTableActionsColumn, getUserFullName } from 'app/shared/util/utils';

const getStatus = (activated: boolean) => {
  return activated ? 'Activated' : 'Inactivated';
};

export interface IUserManagementProps extends StoreProps, RouteComponentProps {}

export const UserManagement = (props: IUserManagementProps) => {
  useEffect(() => {
    props.getUsers({});
  }, []);

  const toggleActive = (user: IUser) => () => {
    props
      .updateUser({
        ...user,
        activated: !user.activated,
      })
      .then(() => {
        props.getUsers({});
      });
  };

  const columns: SearchColumn<IUser>[] = [
    {
      id: 'username',
      accessor: (data: IUser) => getUserFullName(data),
      Header: 'User Name',
      onFilter: (data: IUser, keyword) => filterByKeyword(getUserFullName(data), keyword),
      Cell(cell: { original: IUser }) {
        return getUserFullName(cell.original);
      },
    },
    {
      accessor: 'email',
      Header: 'Email',
      onFilter: (data: IUser, keyword) => (data.email ? filterByKeyword(data.email, keyword) : false),
    },
    {
      accessor: 'activated',
      Header: 'Activated',
      onFilter: (data: IUser, keyword) => (data.activated !== undefined ? filterByKeyword(getStatus(data.activated), keyword) : false),
      Cell(cell: { original: IUser }) {
        return (
          <Button color={cell.original.activated ? 'success' : 'danger'} onClick={toggleActive(cell.original)}>
            {getStatus(cell.original.activated)}
          </Button>
        );
      },
    },
    {
      accessor: 'authorities',
      Header: 'Profiles',
      onFilter: (data: IUser, keyword) => (data.authorities ? filterByKeyword(data.authorities.join(','), keyword) : false),
      Cell(cell: { original: IUser }) {
        return cell.original.authorities
          ? cell.original.authorities.map((authority, i) => (
              <div key={`${cell.original.login}-auth$-${i}`}>
                <Badge color="info">{authority}</Badge>
              </div>
            ))
          : null;
      },
      sortable: false,
    },
    getEntityTableActionsColumn(ENTITY_TYPE.USER),
  ];

  return (
    <div>
      <h2 id="user-management-page-heading">
        Users
        <EntityActionButton className="ms-2" color="primary" entityType={ENTITY_TYPE.USER} entityAction={ENTITY_ACTION.ADD} />
      </h2>
      <div>{props.users && <OncoKBTable data={props.users.concat()} columns={columns} loading={props.loading} showPagination />}</div>
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
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(UserManagement);
