import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import React, { useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface ILogoutProps extends StoreProps, RouteComponentProps {
  logoutUrl: string | null;
}

const Logout = (props: ILogoutProps) => {
  useEffect(() => {
    props.logout();
  }, []);

  return <></>;
};

const mapStoreToProps = (storeState: IRootStore) => ({
  isAuthenticated: storeState.authStore.isAuthenticated,
  logoutUrl: storeState.authStore.logoutUrl,
  logout: storeState.authStore.logout,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Logout);
