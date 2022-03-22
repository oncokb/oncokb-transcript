import React from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { Row } from 'reactstrap';

export interface ILogoutProps extends StoreProps {
  logoutUrl: string;
}

class Logout extends React.Component<ILogoutProps> {
  constructor(props: ILogoutProps) {
    super(props);
  }

  componentDidMount() {
    this.props.logout();
  }

  render() {
    if (this.props.logoutUrl) {
      window.location.href = this.props.logoutUrl;
    }

    return (
      <Row className="justify-content-center">
        <h4>Logged out.</h4>
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
