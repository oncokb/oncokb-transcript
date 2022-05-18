import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Row, Col, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IRootStore } from 'app/stores';

import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { flow, flowResult } from 'mobx';
import _ from 'lodash';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';

export interface IAlterationUpdateProps extends StoreProps, RouteComponentProps<{ id: string }> {}

export const AlterationUpdate = (props: IAlterationUpdateProps) => {
  const [isNew] = useState(!props.match.params || !props.match.params.id);
  const [proteinChange, setProteinChange] = useState('');
  const [proteinChangeAlteration, setProteinChangeAlteration] = useState(null);
  const [selectedGenes, setSelectedGenes] = useState([]);

  const genes = props.genes;
  const consequences = props.consequences;
  const alterationEntity = props.alterationEntity;
  const loading = props.loading;
  const updating = props.updating;
  const updateSuccess = props.updateSuccess;

  const geneOptions = genes.map(gene => ({ label: gene.hugoSymbol, value: gene.id }));
  const alterationReferenceGenomes = props.alterationEntity.referenceGenomes?.map(rg => rg.referenceGenome) || [];
  const referenceGenomeOptions = Object.keys(ReferenceGenome).map(key => {
    if (alterationReferenceGenomes.includes(ReferenceGenome[key])) {
      return {
        label: ReferenceGenome[key],
        value: props.alterationEntity.referenceGenomes.filter(rg => rg.referenceGenome === ReferenceGenome[key])[0].id,
      };
    } else {
      return { label: ReferenceGenome[key], value: ReferenceGenome[key] };
    }
  });
  const consequenceOptions = consequences.map(consequence => ({ label: consequence.name, value: consequence.id }));

  const getDefaultValues = entity => ({
    ...entity,
    genes: entity ? entity.genes : [],
    referenceGenomes: entity ? entity.referenceGenomes : [],
    consequence: entity?.consequence,
  });

  const defaultValues = useCallback(() => {
    let defaultAlt;
    if (proteinChange) {
      defaultAlt = getDefaultValues(proteinChangeAlteration);
    } else {
      defaultAlt = isNew ? {} : getDefaultValues(props.alterationEntity);
    }

    const _genes =
      defaultAlt.genes && defaultAlt.genes.length > 0
        ? defaultAlt.genes.map(gene => ({
            label: gene.hugoSymbol,
            value: gene.id,
          }))
        : selectedGenes;
    return {
      ...defaultAlt,
      genes: _genes,
      consequence: defaultAlt.consequence ? { label: defaultAlt?.consequence.name, value: defaultAlt?.consequence.id } : null,
      referenceGenomes: defaultAlt.referenceGenomes
        ? defaultAlt.referenceGenomes.map(rg => ({
            label: rg.referenceGenome,
            value: rg.id,
          }))
        : null,
    };
  }, [props.alterationEntity, proteinChangeAlteration, selectedGenes]);

  const handleClose = () => {
    props.history.push('/alteration' + props.location.search);
  };

  useEffect(() => {
    if (isNew) {
      props.reset();
    } else {
      props.getEntity(props.match.params.id);
    }

    props.getGenes({});
    props.getConsequences({});
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...alterationEntity,
      ...values,
      genes: values.genes.map(gene => ({ id: gene.value, hugoSymbol: gene.label })),
      referenceGenomes: values.referenceGenomes?.map(rg => {
        if (rg.value === rg.label) {
          return { referenceGenome: rg.label };
        } else {
          return { id: rg.value, referenceGenome: rg.label };
        }
      }),
      consequence: { id: values.consequence.value, name: values.consequence.label },
    };

    if (isNew) {
      props.createEntity(entity);
    } else {
      props.updateEntity(entity);
    }
  };

  useEffect(() => {
    const setData = async () => {
      setProteinChangeAlteration(
        await flowResult(
          props.annotateAlteration({
            geneIds: selectedGenes.map(selectedGene => selectedGene.value),
            alteration: proteinChange,
          })
        )
      );
    };
    if (isNew) {
      setData();
    }
  }, [proteinChange, selectedGenes]);

  const onChange = _.debounce((newProteinChange: string) => {
    setProteinChange(newProteinChange);
  }, 1000);

  const onGenesSelectChange = selectedValues => {
    setSelectedGenes(selectedValues);
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.alteration.home.createOrEditLabel" data-cy="AlterationCreateUpdateHeading">
            Create or edit a Alteration
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              <ValidatedSelect label="Genes" name={'genes'} isMulti options={geneOptions} onChange={onGenesSelectChange} />
              {!isNew ? <ValidatedField name="id" required readOnly id="alteration-id" label="ID" validate={{ required: true }} /> : null}
              <ValidatedField
                label="Alteration"
                id="alteration-alteration"
                name="alteration"
                data-cy="alteration"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
                onChange={event => onChange(event.target.value)}
                placeholder="Input protein change"
              />
              <ValidatedSelect label="Reference Genomes" name={'referenceGenomes'} options={referenceGenomeOptions} isMulti />
              <ValidatedField
                label="Name"
                id="alteration-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Protein Start" id="alteration-proteinStart" name="proteinStart" data-cy="proteinStart" type="text" />
              <ValidatedField label="Protein End" id="alteration-proteinEnd" name="proteinEnd" data-cy="proteinEnd" type="text" />
              <ValidatedField label="Ref Residues" id="alteration-refResidues" name="refResidues" data-cy="refResidues" type="text" />
              <ValidatedField
                label="Variant Residues"
                id="alteration-variantResidues"
                name="variantResidues"
                data-cy="variantResidues"
                type="text"
              />
              <ValidatedSelect label="Consequence" name={'consequence'} options={consequenceOptions} menuPlacement="top" isClearable />
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  genes: storeState.geneStore.entities,
  consequences: storeState.consequenceStore.entities,
  alterationEntity: storeState.alterationStore.entity,
  loading: storeState.alterationStore.loading,
  updating: storeState.alterationStore.updating,
  updateSuccess: storeState.alterationStore.updateSuccess,
  getGenes: storeState.geneStore.getEntities,
  getConsequences: storeState.consequenceStore.getEntities,
  getEntity: storeState.alterationStore.getEntity,
  annotateAlteration: flow(storeState.alterationStore.annotateAlteration),
  updateEntity: storeState.alterationStore.updateEntity,
  createEntity: storeState.alterationStore.createEntity,
  reset: storeState.alterationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationUpdate);
