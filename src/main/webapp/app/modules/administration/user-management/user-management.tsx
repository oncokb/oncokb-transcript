import React, { useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import { IRootStore } from 'app/stores/createStore';
import { IUser } from 'app/shared/model/user.model';
import { Column } from 'react-table';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import OncoKBTable from 'app/shared/table/OncoKBTable';
import { getEntityTableActionsColumn } from 'app/shared/util/utils';

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

  const columns: Column<IUser>[] = [
    {
      id: 'username',
      Header: 'User Name',
      Cell(cell: { original: IUser }) {
        return `${cell.original.firstName} ${cell.original.lastName}`;
      },
    },
    {
      accessor: 'email',
      Header: 'Email',
    },
    {
      accessor: 'activated',
      Header: 'Activated',
      Cell(cell: { original: IUser }) {
        return cell.original.activated ? (
          <Button color="success" onClick={toggleActive(cell.original)}>
            Activated
          </Button>
        ) : (
          <Button color="danger" onClick={toggleActive(cell.original)}>
            Deactivated
          </Button>
        );
      },
    },
    {
      accessor: 'authorities',
      Header: 'Profiles',
      Cell(cell: { original: IUser }) {
        return cell.original.authorities
          ? cell.original.authorities.map((authority, i) => (
              <div key={`${cell.original.login}-auth$-${i}`}>
                <Badge color="info">{authority}</Badge>
              </div>
            ))
          : null;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.USER),
  ];

  return (
    <div>
      <h2 id="user-management-page-heading">
        Users
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.USER} entityAction={ENTITY_ACTION.CREATE} />
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
