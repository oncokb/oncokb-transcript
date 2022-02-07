import React, { useEffect } from 'react';
import { ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { connect } from 'app/shared/util/typed-inject';
import { Button, Alert, Col, Row } from 'reactstrap';
import { toast } from 'react-toastify';

import { IRootStore } from 'app/shared/stores';

export const PasswordResetInit = (props: StoreProps) => {
  useEffect(
    () => () => {
      props.reset();
    },
    []
  );

  const handleValidSubmit = ({ email }) => {
    props.handlePasswordResetInit(email);
  };

  const successMessage = props.successMessage;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>Reset your password</h1>
          <Alert color="warning">
            <p>Enter the email address you used to register</p>
          </Alert>
          <ValidatedForm onSubmit={handleValidSubmit}>
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
              data-cy="emailResetPassword"
            />
            <Button color="primary" type="submit" data-cy="submit">
              Reset password
            </Button>
          </ValidatedForm>
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = ({ passwordResetStore }: IRootStore) => ({
  handlePasswordResetInit: passwordResetStore.handlePasswordResetInit,
  reset: passwordResetStore.reset,
  successMessage: passwordResetStore.successMessage,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(PasswordResetInit);
