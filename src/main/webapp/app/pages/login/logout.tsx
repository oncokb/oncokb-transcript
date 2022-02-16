import React from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { action, makeObservable, observable } from 'mobx';
import { PAGE_ROUTE, SHORT_REDIRECT } from 'app/config/constants';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Row } from 'reactstrap';

export interface ILogoutProps extends StoreProps {
  logoutUrl: string;
}

class Logout extends React.Component<ILogoutProps> {
  redirect = false;

  constructor(props: ILogoutProps) {
    super(props);
    makeObservable(this, {
      redirect: observable,
      toggleRedirect: action.bound,
    });
  }

  componentDidMount() {
    this.props.logout();
    setTimeout(this.toggleRedirect, SHORT_REDIRECT);
  }

  toggleRedirect() {
    this.redirect = !this.redirect;
  }

  render() {
    const { logoutUrl } = this.props;
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }

    if (this.redirect) {
      return <Redirect to={PAGE_ROUTE.HOME} />;
    }
    return (
      <Row className="justify-content-center">
        <h4>Logged out successfully!</h4>
      </Row>
    );
  }
}

const mapStoreToProps = (storeState: IRootStore) => ({
  logoutUrl: storeState.authStore.logoutUrl,
  logout: storeState.authStore.logout,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default componentInject(mapStoreToProps)(observer(Logout));
