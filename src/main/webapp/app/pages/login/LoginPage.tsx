import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { IRootStore } from 'app/stores';
import { PAGE_ROUTE } from 'app/config/constants';

export interface ILoginProps extends StoreProps, RouteComponentProps {}

export const Login = (props: ILoginProps) => {
  const { isAuthenticated, fetchingsession } = props;

  const { location } = props;
  const { from } = (location.state as any) || { from: { pathname: '/', search: location.search } };
  if (isAuthenticated) {
    return <Redirect to={from} />;
  }
  if (!fetchingsession) {
    return <Redirect to={PAGE_ROUTE.OAUTH} />;
  }
  return null;
};

const mapStoreToProps = ({ authStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  fetchingsession: authStore.fetchingSession,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Login);
