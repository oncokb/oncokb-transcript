import React, { useLayoutEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';

import { IRootStore } from 'app/stores';

export interface ILogoutProps extends StoreProps {
  logoutUrl: string;
}

export const Logout = (props: ILogoutProps) => {
  useLayoutEffect(() => {
    props.logout();
    const { logoutUrl } = props;
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
  });

  return (
    <div className="p-5">
      <h4>Logged out successfully!</h4>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  logoutUrl: storeState.authStore.logoutUrl,
  logout: storeState.authStore.logout,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Logout);
