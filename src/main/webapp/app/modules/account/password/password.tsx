import React, { useState, useEffect } from 'react';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { connect } from 'app/shared/util/typed-inject';
import { Row, Col, Button } from 'reactstrap';
import { toast } from 'react-toastify';

import { IRootStore } from 'app/shared/stores';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';
export type IUserPasswordProps = StoreProps;

export const PasswordPage = (props: IUserPasswordProps) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    props.reset();
    props.getSession();
    return () => {
      props.reset();
    };
  }, []);

  const handleValidSubmit = ({ currentPassword, newPassword }) => {
    props.savePassword(currentPassword, newPassword);
  };

  const updatePassword = event => setPassword(event.target.value);

  const { account, successMessage, errorMessage } = props;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    } else if (errorMessage) {
      toast.success(errorMessage);
    }
  }, [successMessage, errorMessage]);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="password-title">Password for {account.login}</h2>
          <ValidatedForm id="password-form" onSubmit={handleValidSubmit}>
            <ValidatedField
              name="currentPassword"
              label="Current password"
              placeholder="Current password"
              type="password"
              validate={{
                required: { value: true, message: 'Your password is required.' },
              }}
              data-cy="currentPassword"
            />
            <ValidatedField
              name="newPassword"
              label="New password"
              placeholder="New password"
              type="password"
              validate={{
                required: { value: true, message: 'Your password is required.' },
                minLength: { value: 4, message: 'Your password is required to be at least 4 characters.' },
                maxLength: { value: 50, message: 'Your password cannot be longer than 50 characters.' },
              }}
              onChange={updatePassword}
              data-cy="newPassword"
            />
            <PasswordStrengthBar password={password} />
            <ValidatedField
              name="confirmPassword"
              label="New password confirmation"
              placeholder="Confirm the new password"
              type="password"
              validate={{
                required: { value: true, message: 'Your confirmation password is required.' },
                minLength: { value: 4, message: 'Your confirmation password is required to be at least 4 characters.' },
                maxLength: { value: 50, message: 'Your confirmation password cannot be longer than 50 characters.' },
                validate: v => v === password || 'The password and its confirmation do not match!',
              }}
              data-cy="confirmPassword"
            />
            <Button color="success" type="submit" data-cy="submit">
              Save
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ authStore, passwordStore }: IRootStore) => ({
  account: authStore.account,
  successMessage: passwordStore.successMessage,
  errorMessage: passwordStore.errorMessage,
  isAuthenticated: authStore.isAuthenticated,
  getSession: authStore.getSession,
  savePassword: passwordStore.savePassword,
  reset: passwordStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(PasswordPage);
