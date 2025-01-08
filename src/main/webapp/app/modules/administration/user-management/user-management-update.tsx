import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import { isEmail } from 'react-jhipster';
import { IRootStore } from 'app/stores/createStore';
import { SaveButton } from 'app/shared/button/SaveButton';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { USER_AUTHORITY, AUTHORITIES } from 'app/config/constants/constants';
import { hasAnyAuthority } from 'app/shared/auth/private-route';

export interface IUserManagementUpdateProps extends StoreProps, RouteComponentProps<{ login: string }> {}

const authorityOptions = Object.values(USER_AUTHORITY).map(auth => ({ label: auth, value: auth }));

export const UserManagementUpdate = ({
  match,
  history,
  user,
  loading,
  updating,
  featureFlags,
  getUser,
  createUser,
  updateUser,
  reset,
  getFeatureFlags,
  isDev: initialIsDev,
}: IUserManagementUpdateProps) => {
  const [isNew] = useState(!match.params || !match.params.login);
  const [isDev, setIsDev] = useState(initialIsDev);

  useEffect(() => {
    setIsDev(initialIsDev);
  }, [initialIsDev]);

  useEffect(() => {
    getFeatureFlags({});
  }, []);

  useEffect(() => {
    if (isNew) {
      reset();
    } else {
      getUser(match.params.login);
    }
  }, [match.params.login]);

  const handleClose = () => {
    history.push('/admin/user-management');
  };

  // TYPE-ISSUE: Is values supposed to be IUser?
  const saveUser = values => {
    const entity = {
      ...user,
      ...values,
      login: values.email,
      authorities: values.authorities.map(auth => auth.value),
      featureFlags: (values.featureFlags || []).map(f => f.value),
    };
    if (isNew) {
      createUser(entity);
    } else {
      updateUser(entity);
    }
    handleClose();
  };

  const isInvalid = false;

  const defaultValues = useMemo(() => {
    return isNew
      ? {}
      : {
          ...user,
          authorities: user?.authorities?.map(auth => ({ label: auth, value: auth })),
          featureFlags: user?.featureFlags?.map(f => ({ label: f.name, value: f })),
        };
  }, [user]);

  const featureFlagOptions = featureFlags.filter(f => f.enabled).map(f => ({ label: f.name, value: f }));

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
            <ValidatedForm onSubmit={saveUser} defaultValues={defaultValues}>
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
              <ValidatedField
                type="text"
                name="firstName"
                label={'First Name'}
                validate={{
                  required: true,
                  minLength: 1,
                  maxLength: 50,
                }}
              />
              <ValidatedField
                type="text"
                name="lastName"
                label={'Last Name'}
                validate={{
                  required: true,
                  minLength: 1,
                  maxLength: 50,
                }}
              />
              <ValidatedField type="checkbox" name="activated" check={user?.activated?.toString() || 'false'} label={'Activated'} />
              <ValidatedSelect
                required
                isMulti
                label="Profiles"
                name={'authorities'}
                options={authorityOptions}
                defaultValue={[{ label: USER_AUTHORITY.ROLE_USER, value: USER_AUTHORITY.ROLE_USER }]}
                onChange={(selectedOption, actionMeta) => {
                  if (actionMeta.action === 'remove-value' && actionMeta.removedValue?.value === USER_AUTHORITY.ROLE_DEV) {
                    setIsDev(false);
                  }
                  if (actionMeta.action === 'select-option' && selectedOption.some(option => option.value === USER_AUTHORITY.ROLE_DEV)) {
                    setIsDev(true);
                  }
                }}
              />
              {isDev && (
                <ValidatedSelect
                  isMulti
                  label="Feature Flag"
                  name={'featureFlags'}
                  options={featureFlagOptions}
                  getOptionValue={option => String(option.value.id)} // Use featureflag.id as unique identifier
                />
              )}
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
  featureFlags: storeState.featureFlagStore.entities,
  getUser: storeState.userStore.getEntity,
  updateUser: storeState.userStore.updateEntity,
  createUser: storeState.userStore.createEntity,
  reset: storeState.userStore.reset,
  getFeatureFlags: storeState.featureFlagStore.getEntities,
  isDev: hasAnyAuthority(storeState.authStore.account.authorities, [AUTHORITIES.DEV]),
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(UserManagementUpdate);
