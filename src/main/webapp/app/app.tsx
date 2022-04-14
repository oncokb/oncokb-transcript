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
import Footer from 'app/components/footer/footer';
import { hasAnyAuthority } from 'app/shared/auth/private-route';
import { AUTHORITIES } from 'app/config/constants';
import AppRoutes from 'app/routes';
import SideBar from 'app/components/sidebar/SideBar';
import { Col, Container, Row } from 'reactstrap';
import { computed, makeObservable } from 'mobx';

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
    if (!this.props.isAuthenticated || !this.props.isAuthorized) {
      return '0';
    }
    return this.props.isSideBarCollapsed ? '80px' : '200px';
  }

  render() {
    return (
      <Router basename={baseHref}>
        <div className="app-container">
          <ToastContainer position={toast.POSITION.TOP_CENTER} className="toastify-container" toastClassName="toastify-toast" />
          <Header isAuthenticated={this.props.isAuthenticated} isAdmin={this.props.isAdmin} />
          <div style={{ display: 'flex' }}>
            {this.props.isAuthorized && <SideBar />}
            <div style={{ flex: 1, marginLeft: this.sideBarWidth, paddingTop: '2rem' }}>
              <Container fluid>
                <AppRoutes />
              </Container>
              <Footer />
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

const mapStoreToProps = ({ authStore, navigationControlStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  isAuthorized: authStore.isAuthorized,
  isAdmin: hasAnyAuthority(authStore.account.authorities, [AUTHORITIES.ADMIN]),
  getSession: authStore.getSession,
  isSideBarCollapsed: navigationControlStore.isSideBarCollapsed,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(App));
