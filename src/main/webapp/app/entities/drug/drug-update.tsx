import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { Row, Col, Label, FormGroup } from 'reactstrap';
import { ValidatedField, ValidatedForm } from 'react-jhipster';
import { IRootStore } from 'app/stores';
import { SaveButton } from 'app/shared/button/SaveButton';
import { getEntityActionRoute } from 'app/shared/util/RouteUtils';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import NcitCodeSelect, { parseNcitUniqId } from 'app/shared/select/NcitCodeSelect';
import { mapIdList } from 'app/shared/util/entity-utils';
import { IDrug } from 'app/shared/model/drug.model';

export interface IDrugUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const DrugUpdate = (props: IDrugUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);

  const flags = props.flags;
  const drugEntity = props.drugEntity;
  const [selectedNcit, setSelectedNcit] = useState<{ id: number | undefined; code: string | undefined } | null | undefined>({
    id: props.drugEntity?.nciThesaurus?.id,
    code: props.drugEntity?.nciThesaurus?.code,
  });
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const handleClose = () => {
    props.history.push(getEntityActionRoute(ENTITY_TYPE.DRUG, ENTITY_ACTION.EDIT, props.location.search));
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getNciThesauruses({});
    props.getFlags({});
    props.getAssociations({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  useEffect(() => {
    setSelectedNcit({
      id: drugEntity.nciThesaurus?.id,
      code: drugEntity.nciThesaurus?.code,
    });
  }, [drugEntity]);

  const saveEntity = (values: IDrug) => {
    const entity = {
      ...drugEntity,
      ...values,
      flags: mapIdList(values.flags ?? []),
    };
    if (selectedNcit === undefined) {
      delete entity.nciThesaurus;
    } else {
      entity.nciThesaurus = selectedNcit;
    }

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          ...drugEntity,
          nciThesaurusId: drugEntity?.nciThesaurus?.id,
          flags: drugEntity?.flags?.map(e => e.id?.toString()),
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.drug.home.createOrEditLabel" data-cy="DrugCreateUpdateHeading">
            Add or edit a Drug
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="drug-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Uuid"
                id="drug-uuid"
                name="uuid"
                data-cy="uuid"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Name"
                id="drug-name"
                name="name"
                data-cy="name"
                type="textarea"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Flag" id="drug-flag" data-cy="flag" type="select" multiple name="flags">
                <option value="" key="0" />
                {flags
                  ? flags.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <FormGroup>
                <Label>Code</Label>
                {drugEntity.nciThesaurus && (
                  <NcitCodeSelect
                    isMulti={false}
                    ncit={drugEntity.nciThesaurus}
                    onChange={selectedOption => {
                      setSelectedNcit(selectedOption ? parseNcitUniqId(selectedOption.value) : undefined);
                    }}
                  />
                )}
              </FormGroup>
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  nciThesauruses: storeState.nciThesaurusStore.entities,
  flags: storeState.flagStore.entities,
  associations: storeState.associationStore.entities,
  drugEntity: storeState.drugStore.entity,
  loading: storeState.drugStore.loading,
  updating: storeState.drugStore.updating,
  updateSuccess: storeState.drugStore.updateSuccess,
  getNciThesauruses: storeState.nciThesaurusStore.getEntities,
  getFlags: storeState.flagStore.getEntities,
  getAssociations: storeState.associationStore.getEntities,
  getEntity: storeState.drugStore.getEntity,
  updateEntity: storeState.drugStore.updateEntity,
  createEntity: storeState.drugStore.createEntity,
  reset: storeState.drugStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect<IDrugUpdateProps, StoreProps>(mapStoreToProps)(DrugUpdate);
