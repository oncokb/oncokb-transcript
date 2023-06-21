import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import React, { useEffect, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { observer } from 'mobx-react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { IRootStore } from 'app/stores';
import Header from 'app/components/header/header';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';
import NavigationSidebar from 'app/components/sidebar/NavigationSidebar';
import { Container } from 'reactstrap';
import CurationPanel from './components/curationPanel/CurationPanel';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');

export type IAppProps = StoreProps;

const App: React.FunctionComponent<IAppProps> = (props: IAppProps) => {
  const [sideBarWidth, setSideBarWidth] = useState('0');

  useEffect(() => {
    props.getSession();
  }, []);

  useEffect(() => {
    setSideBarWidth(!props.isAuthenticated || !props.isAuthorized ? '0' : `${props.sidebarWidth}px`);
  }, [props.isAuthenticated, props.isAuthorized, props.sidebarWidth]);

  useEffect(() => {
    if (props.hasFirebaseAccess) {
      props.initializeFirebase();
      props.authenticateWithFirebase();
    }
  }, [props.hasFirebaseAccess]);

  const getCurationPanelDisplay = () => {
    return props.showCurationPanel ? '' : 'none';
  };

  return (
    <Router basename={baseHref}>
      <div className="app-container">
        <ToastContainer position={toast.POSITION.TOP_CENTER} className="toastify-container" toastClassName="toastify-toast" />
        <Header isAuthenticated={props.isAuthenticated} isAdmin={props.isAdmin} />
        <div style={{ display: 'flex' }}>
          {props.isAuthorized && <NavigationSidebar />}
          <div style={{ flex: 1, marginLeft: sideBarWidth, padding: '2rem 0 2rem' }}>
            <Container fluid>
              <AppRoutes />
            </Container>
          </div>
          <div style={{ float: 'right', width: '350px', display: getCurationPanelDisplay() }}>
            <CurationPanel />
          </div>
        </div>
      </div>
    </Router>
  );
};

const mapStoreToProps = ({ authStore, layoutStore, firebaseStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  isAuthorized: authStore.isAuthorized,
  isAdmin: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.ADMIN]),
  hasFirebaseAccess: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.FIREBASE]),
  getSession: authStore.getSession,
  sidebarWidth: layoutStore.sidebarWidth,
  showCurationPanel: layoutStore.showCurationPanel,
  initializeFirebase: firebaseStore.initializeFirebase,
  authenticateWithFirebase: firebaseStore.signInToFirebase,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(App));
