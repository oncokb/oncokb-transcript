import React, { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'react-table/react-table.css';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IRootStore } from 'app/stores';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';
import NavigationSidebar from 'app/components/sidebar/NavigationSidebar';
import CurationPanel from './components/curationPanel/CurationPanel';
import Layout from './layout';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');

export type IAppProps = StoreProps;

const App: React.FunctionComponent<IAppProps> = (props: IAppProps) => {
  useEffect(() => {
    props.getSession();
  }, []);

  useEffect(() => {
    let authSubscriber = undefined;
    if (props.hasFirebaseAccess) {
      authSubscriber = props.initializeFirebase();
    }
    return () => authSubscriber && authSubscriber();
  }, [props.hasFirebaseAccess]);

  return (
    <Router basename={baseHref}>
      <Layout>
        <div className="app-container">
          <ToastContainer position={toast.POSITION.TOP_CENTER} className="toastify-container" toastClassName="toastify-toast" />
          <div>
            {props.isAuthorized && <NavigationSidebar />}
            <div className="app-center-content-wrapper" style={{ margin: props.centerContentMargin }}>
              <AppRoutes />
            </div>
            {props.showCurationPanel && <CurationPanel width={props.curationPanelWidth} />}
          </div>
        </div>
      </Layout>
    </Router>
  );
};

const mapStoreToProps = ({ authStore, layoutStore, firebaseStore }: IRootStore) => ({
  isAuthorized: authStore.isAuthorized,
  hasFirebaseAccess: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.FIREBASE]),
  getSession: authStore.getSession,
  navigationSidebarWidth: layoutStore.navigationSidebarWidth,
  toggleNavSidebar: layoutStore.toggleNavigationSidebar,
  showCurationPanel: layoutStore.showCurationPanel,
  curationPanelWidth: layoutStore.curationPanelWidth,
  centerContentMargin: layoutStore.centerContentMargin,
  initializeFirebase: firebaseStore.initializeFirebase,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(App));
