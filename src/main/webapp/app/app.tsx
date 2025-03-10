import React, { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import 'oncokb-styles/dist/oncokb.css';
import './app.scss';
import 'react-table/react-table.css';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { ToastContainer } from 'react-toastify';
import { IRootStore } from 'app/stores';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants/constants';
import AppRoutes from 'app/routes/routes';
import NavigationSidebar from 'app/components/sidebar/NavigationSidebar';
import Layout from './layout';
import LoadingIndicator, { LoaderSize } from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { Unsubscribe } from 'firebase/database';
import BetaSiteMessage from './shared/userMessage/BetaSiteMessage';
import { Router } from 'react-router-dom';

const App: React.FunctionComponent<StoreProps> = (props: StoreProps) => {
  useEffect(() => {
    let authSubscriber: Unsubscribe | undefined = undefined;
    if (props.isCurator) {
      authSubscriber = props.initializeFirebase();
    }
    return () => authSubscriber?.();
  }, [props.isCurator]);

  return (
    <Router history={props.history}>
      <Layout>
        <div className="app-container">
          <ToastContainer
            position={'top-center'}
            className="toastify-container"
            toastClassName="toastify-toast"
            pauseOnHover
            pauseOnFocusLoss
          />
          <BetaSiteMessage />
          {props.loadingAuth && <LoadingIndicator isLoading size={LoaderSize.LARGE} center={true} />}
          {props.authAccount && (
            <div>
              {props.isAuthorized && <NavigationSidebar />}
              <div className="app-center-content-wrapper" style={{ margin: props.centerContentMargin }}>
                <AppRoutes />
              </div>
            </div>
          )}
        </div>
      </Layout>
    </Router>
  );
};

const mapStoreToProps = ({ authStore, layoutStore, firebaseAppStore, routerStore }: IRootStore) => ({
  isAuthorized: authStore.isAuthorized,
  authorities: authStore.account.authorities,
  isCurator: hasAnyAuthority(authStore.account.authorities ?? [], [AUTHORITIES.CURATOR]),
  loadingAuth: authStore.loading,
  authAccount: authStore.account,
  navigationSidebarWidth: layoutStore.navigationSidebarWidth,
  toggleNavSidebar: layoutStore.toggleNavigationSidebar,
  centerContentMargin: layoutStore.centerContentMargin,
  initializeFirebase: firebaseAppStore.initializeFirebase,
  history: routerStore.history,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(App));
