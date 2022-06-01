import 'react-toastify/dist/ReactToastify.css';
import './app.scss';
import 'app/config/dayjs.ts';
import React from 'react';
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
import { computed, makeObservable } from 'mobx';
import CurationPanel from './components/curationPanel/CurationPanel';

const baseHref = document.querySelector('base').getAttribute('href').replace(/\/$/, '');

export type IAppProps = StoreProps;

class App extends React.Component<IAppProps> {
  constructor(props: IAppProps) {
    super(props);
    props.getSession();
    makeObservable(this, {
      sideBarWidth: computed,
    });
  }

  get sideBarWidth() {
    return !this.props.isAuthenticated || !this.props.isAuthorized ? '0' : `${this.props.sidebarWidth}px`;
  }

  get curationPanelDisplay() {
    return this.props.showCurationPanel ? '' : 'none';
  }

  render() {
    return (
      <Router basename={baseHref}>
        <div className="app-container">
          <ToastContainer position={toast.POSITION.TOP_CENTER} className="toastify-container" toastClassName="toastify-toast" />
          <Header isAuthenticated={this.props.isAuthenticated} isAdmin={this.props.isAdmin} />
          <div style={{ display: 'flex' }}>
            {this.props.isAuthorized && <NavigationSidebar />}
            <div style={{ flex: 1, marginLeft: this.sideBarWidth, padding: '2rem 0 2rem' }}>
              <Container fluid>
                <AppRoutes />
              </Container>
            </div>
            <div style={{ float: 'right', width: '350px', display: this.curationPanelDisplay }}>
              <CurationPanel />
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

const mapStoreToProps = ({ authStore, layoutStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  isAuthorized: authStore.isAuthorized,
  isAdmin: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.ADMIN]),
  getSession: authStore.getSession,
  sidebarWidth: layoutStore.sidebarWidth,
  showCurationPanel: layoutStore.showCurationPanel,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(App));
