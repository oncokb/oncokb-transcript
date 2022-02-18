import React, { useEffect } from 'react';
import { Button, Col, Row } from 'reactstrap';
import { connect } from 'app/shared/util/typed-inject';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { toast } from 'react-toastify';

import { IRootStore } from 'app/stores';
export type IUserSettingsProps = StoreProps;

export const SettingsPage = (props: IUserSettingsProps) => {
  const account = props.account;
  const successMessage = props.successMessage;

  useEffect(() => {
    props.getSession();
    return () => {
      props.reset();
    };
  }, []);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  const handleValidSubmit = values => {
    props.saveAccountSettings({
      ...account,
      ...values,
    });
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="settings-title">User settings for {account.login}</h2>
          <ValidatedForm id="settings-form" onSubmit={handleValidSubmit} defaultValues={account}>
            <ValidatedField
              name="firstName"
              label="First Name"
              id="firstName"
              placeholder="Your first name"
              validate={{
                required: { value: true, message: 'Your first name is required.' },
                minLength: { value: 1, message: 'Your first name is required to be at least 1 character' },
                maxLength: { value: 50, message: 'Your first name cannot be longer than 50 characters' },
              }}
              data-cy="firstname"
            />
            <ValidatedField
              name="lastName"
              label="Last Name"
              id="lastName"
              placeholder="Your last name"
              validate={{
                required: { value: true, message: 'Your last name is required.' },
                minLength: { value: 1, message: 'Your last name is required to be at least 1 character' },
                maxLength: { value: 50, message: 'Your last name cannot be longer than 50 characters' },
              }}
              data-cy="lastname"
            />
            <ValidatedField
              name="email"
              label="Email"
              placeholder={'Your email'}
              type="email"
              validate={{
                required: { value: true, message: 'Your email is required.' },
                minLength: { value: 5, message: 'Your email is required to be at least 5 characters.' },
                maxLength: { value: 254, message: 'Your email cannot be longer than 50 characters.' },
                validate: v => isEmail(v) || 'Your email is invalid.',
              }}
              data-cy="email"
            />
            <Button color="primary" type="submit" data-cy="submit">
              Save
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ authStore, settingsStore }: IRootStore) => ({
  account: authStore.account,
  isAuthenticated: authStore.isAuthenticated,
  getSession: authStore.getSession,
  saveAccountSettings: settingsStore.saveAccountSettings,
  reset: settingsStore.reset,
  successMessage: settingsStore.successMessage,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(SettingsPage);
