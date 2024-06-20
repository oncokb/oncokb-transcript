import React, { useEffect } from 'react';
import { Badge, Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { connect } from 'app/shared/util/typed-inject';

import { IRootStore } from 'app/stores';
export type IUserSettingsProps = StoreProps;

export const SettingsPage = (props: IUserSettingsProps) => {
  const account = props.account;

  useEffect(() => {
    props.getSession();
    return () => {
      props.reset();
    };
  }, []);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="settings-title">User Settings</h2>
          <FormGroup>
            <Label id={`fullNameLabel`} for="fullName">
              Name
            </Label>
            <Input name="fullName" id="fullName" value={props.fullName} disabled />
          </FormGroup>
          <FormGroup>
            <Label id={`emailLabel`} for="email">
              Email
            </Label>
            <Input name="email" id="email" value={account.email} disabled />
          </FormGroup>
          <FormGroup>
            <Label id={`authoritiesLabel`}>Roles</Label>
            {account.authorities &&
              account.authorities.map((authority, i) => (
                <div key={`${account.login}-auth$-${i}`}>
                  <Badge color="info">{authority}</Badge>
                </div>
              ))}
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ authStore, settingsStore }: IRootStore) => ({
  account: authStore.account,
  fullName: authStore.fullName,
  isAuthenticated: authStore.isAuthenticated,
  getSession: authStore.getSession,
  reset: settingsStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IUserSettingsProps, StoreProps>(mapStoreToProps)(SettingsPage);
