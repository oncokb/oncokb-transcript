import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Button, Alert, Row, Col, Form } from 'reactstrap';
import { AvField, AvForm } from 'availity-reactstrap-validation';

import { IRootStore } from 'app/stores';
import SmallPageContainer from 'app/oncokb-commons/components/page/SmallPageContainer';
export interface ILoginProps extends StoreProps, RouteComponentProps {}

export const Login = (props: ILoginProps) => {
  const { isAuthenticated, loginError } = props;

  const handleLogin = (event: any, { email, password }: { email: string; password: string }) => {
    props.login(email, password, false);
  };

  const { location } = props;
  const { from } = (location.state as any) || { from: { pathname: '/', search: location.search } };
  if (isAuthenticated) {
    return <Redirect to={from} />;
  }
  return (
    <SmallPageContainer>
      <AvForm onValidSubmit={handleLogin}>
        <Row>
          <Col md="12">
            {loginError ? (
              <Alert color="danger" data-cy="loginError">
                <strong>Failed to sign in!</strong> Please check your credentials and try again.
              </Alert>
            ) : null}
          </Col>
          <Col md="12">
            <AvField name="email" label="Email" placeholder="Your email address" type="text" autoFocus required />
            <AvField
              name="password"
              type="password"
              label="Password"
              placeholder="Your password"
              required
              errorMessage="Password cannot be empty!"
            />
          </Col>
          <Col md="12">
            <Button color="primary" type="submit">
              Sign in
            </Button>
          </Col>
        </Row>
      </AvForm>
    </SmallPageContainer>
  );
};

const mapStoreToProps = ({ authStore }: IRootStore) => ({
  isAuthenticated: authStore.isAuthenticated,
  loginError: authStore.loginError,
  showModalLogin: authStore.showModalLogin,
  login: authStore.login,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Login);
