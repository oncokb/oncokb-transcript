import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { isEmail } from 'react-jhipster';
import { IRootStore } from 'app/stores/createStore';
import { SaveButton } from 'app/shared/button/SaveButton';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { USER_AUTHORITY } from 'app/config/constants';

export interface IUserManagementUpdateProps extends StoreProps, RouteComponentProps<{ login: string }> {}

const authorityOptions = Object.values(USER_AUTHORITY).map(auth => ({ label: auth, value: auth }));

export const UserManagementUpdate = (props: IUserManagementUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.login);

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getUser(props.match.params.login);
    }
  }, [props.match.params.login]);

  const handleClose = () => {
    props.history.push('/admin/user-management');
  };

  const saveUser = values => {
    const entity = {
      ...user,
      ...values,
      login: values.email,
      authorities: values.authorities.map(auth => auth.value),
    };
    if (isNew) {
      props.createUser(entity);
    } else {
      props.updateUser(entity);
    }
    handleClose();
  };

  const isInvalid = false;
  const { user, loading, updating } = props;

  const defaultValues = () => {
    return isNew
      ? {}
      : {
          ...user,
          authorities: user?.authorities?.map(auth => ({ label: auth, value: auth })),
        };
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h1>{isNew ? 'Create' : 'Edit'} User</h1>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm onSubmit={saveUser} defaultValues={defaultValues()}>
              {user.id ? <ValidatedField type="text" name="id" required readOnly label={'ID'} validate={{ required: true }} /> : null}
              <ValidatedField
                name="email"
                label={'Email'}
                placeholder={'Enter your email'}
                type="email"
                validate={{
                  required: true,
                  minLength: 5,
                  maxLength: 254,
                  validate: v => isEmail(v),
                }}
              />
              <ValidatedField type="text" name="firstName" label={'First Name'} />
              <ValidatedField type="text" name="lastName" label={'Last Name'} />
              <ValidatedField type="checkbox" name="activated" check={user?.activated?.toString() || 'false'} label={'Activated'} />
              <ValidatedSelect isMulti label="Profiles" name={'authorities'} options={authorityOptions} />
              <SaveButton disabled={isInvalid || updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  user: storeState.userStore.entity,
  loading: storeState.userStore.loading,
  updating: storeState.userStore.updating,
  getUser: storeState.userStore.getEntity,
  updateUser: storeState.userStore.updateEntity,
  createUser: storeState.userStore.createEntity,
  reset: storeState.userStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(UserManagementUpdate);
