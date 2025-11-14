import { REFERENCE_GENOME } from 'app/config/constants/constants';
import { Alteration, Gene } from 'app/shared/api/generated/curation';
import { SaveButton } from 'app/shared/button/SaveButton';
import GeneSelect, { GeneSelectOption } from 'app/shared/select/GeneSelect';
import { connect } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import _ from 'lodash';
import { flow, flowResult } from 'mobx';
import React, { useCallback, useEffect, useState } from 'react';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { Col, FormGroup, Label, Row } from 'reactstrap';
import ValidatedForm from 'app/shared/form/ValidatedForm';

interface BaseProps extends StoreProps {
  defaultGene?: GeneSelectOption | null;
}

interface NewAlterationProps extends BaseProps {
  isNew: true;
  id?: string;
}

interface ExistingAlterationProps extends BaseProps {
  isNew: false;
  id: string;
}

export type AlterationFormProps = NewAlterationProps | ExistingAlterationProps;

const AlterationForm = ({
  defaultGene,
  id,
  isNew,
  reset,
  getEntity,
  getConsequences,
  consequences,
  alterationEntity,
  loading,
  updating,
  createEntity,
  updateEntity,
  annotateAlterations,
}: AlterationFormProps) => {
  const [proteinChange, setProteinChange] = useState('');
  const [proteinChangeAlteration, setProteinChangeAlteration] = useState(null);
  const [selectedGenes, setSelectedGenes] = useState<GeneSelectOption | null>(null);

  useEffect(() => {
    if (isNew) {
      reset();
      if (defaultGene) {
        setSelectedGenes(defaultGene);
      }
    } else {
      getEntity(id);
    }
    getConsequences({});
  }, []);

  const consequenceOptions = consequences.map(consequence => ({ label: consequence.term, value: consequence.id }));

  const getDefaultValues = entity => ({
    type: 'UNKNOWN',
    ...entity,
    referenceGenomes: entity ? entity.referenceGenomes : [],
    consequence: entity?.consequence,
  });

  const defaultValues = useCallback(() => {
    let defaultAlt;
    if (proteinChange) {
      defaultAlt = getDefaultValues(proteinChangeAlteration);
    } else {
      defaultAlt = isNew ? {} : getDefaultValues(alterationEntity);
    }
    return {
      ...defaultAlt,
      consequence: defaultAlt.consequence ? { label: defaultAlt?.consequence.term, value: defaultAlt?.consequence.id } : null,
      referenceGenomes: defaultAlt.referenceGenomes
        ? defaultAlt.referenceGenomes.map(rg => ({
            label: rg.referenceGenome,
            value: rg.id,
          }))
        : null,
    };
  }, [alterationEntity, proteinChangeAlteration]);

  useEffect(() => {
    if (!isNew) {
      const _genes =
        alterationEntity.genes && alterationEntity.genes.length > 0
          ? alterationEntity.genes.map(gene => ({ label: gene.hugoSymbol, value: gene.id }))
          : [];
      setSelectedGenes(_genes[0] ?? null);
    }
  }, [alterationEntity, isNew]);

  const saveEntity = values => {
    const entity = {
      ...alterationEntity,
      ...values,
      genes: selectedGenes ? [{ id: selectedGenes.value, hugoSymbol: selectedGenes.label }] : [],
      referenceGenomes: values.referenceGenomes?.map(rg => {
        if (rg.value === rg.label) {
          return { referenceGenome: rg.label };
        } else {
          return { id: rg.value, referenceGenome: rg.label };
        }
      }),
      consequence:
        values.consequence && values.consequence.value !== undefined
          ? { id: values.consequence.value, term: values.consequence.label }
          : null,
    };

    if (isNew) {
      createEntity(entity);
    } else {
      updateEntity(entity);
    }
  };

  useEffect(() => {
    if (isNew) {
      const setData = async () => {
        const annotationResult = await flowResult(
          annotateAlterations([
            {
              referenceGenome: REFERENCE_GENOME.GRCH37,
              alteration: {
                genes: selectedGenes ? ([{ id: selectedGenes.value }] as Gene[]) : ([] as Gene[]),
                alteration: proteinChange,
              } as Alteration,
            },
          ]),
        );
        setProteinChangeAlteration(annotationResult[0].entity);
      };
      setData();
    }
  }, [proteinChange, selectedGenes]);

  const onChange = _.debounce((newProteinChange: string) => {
    setProteinChange(newProteinChange);
  }, 1000);

  const onGenesSelectChange = (selectedValue: GeneSelectOption | null) => {
    setSelectedGenes(selectedValue);
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="oncokbCurationApp.alteration.home.createOrEditLabel" data-cy="AlterationCreateUpdateHeading">
            Add or edit a Alteration
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? <ValidatedField name="id" required readOnly id="alteration-id" label="ID" validate={{ required: true }} /> : null}
              <FormGroup>
                <Label>Gene</Label>
                <GeneSelect onChange={onGenesSelectChange} value={selectedGenes} />
              </FormGroup>
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
              <ValidatedField label="Type" id="alteration-type" name="type" data-cy="type" type="select">
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="GENOMIC_CHANGE">GENOMIC_CHANGE</option>
                <option value="CDNA_CHANGE">CDNA_CHANGE</option>
                <option value="PROTEIN_CHANGE">PROTEIN_CHANGE</option>
                <option value="COPY_NUMBER_ALTERATION">COPY_NUMBER_ALTERATION</option>
                <option value="STRUCTURAL_VARIANT">STRUCTURAL_VARIANT</option>
                <option value="NA">NA</option>
              </ValidatedField>
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
              <ValidatedField
                label="Protein Change"
                id="alteration-protein-change"
                name="proteinChange"
                data-cy="proteinChange"
                type="text"
              />
              <ValidatedField label="Start" id="alteration-start" name="start" data-cy="start" type="text" />
              <ValidatedField label="End" id="alteration-end" name="end" data-cy="end" type="text" />
              <ValidatedField label="Ref Residues" id="alteration-refResidues" name="refResidues" data-cy="refResidues" type="text" />
              <ValidatedField
                label="Variant Residues"
                id="alteration-variantResidues"
                name="variantResidues"
                data-cy="variantResidues"
                type="text"
              />
              <ValidatedSelect label="Consequence" name={'consequence'} options={consequenceOptions} menuPlacement="top" isClearable />
              <SaveButton disabled={updating} />
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

const mapStoreToProps = (storeState: IRootStore) => ({
  transcripts: storeState.transcriptStore.entities,
  consequences: storeState.consequenceStore.entities,
  alterationEntity: storeState.alterationStore.entity,
  loading: storeState.alterationStore.loading,
  updating: storeState.alterationStore.updating,
  updateSuccess: storeState.alterationStore.updateSuccess,
  getTranscripts: storeState.transcriptStore.getEntities,
  getConsequences: storeState.consequenceStore.getEntities,
  getEntity: storeState.alterationStore.getEntity,
  annotateAlterations: flow(storeState.alterationStore.annotateAlterations),
  updateEntity: storeState.alterationStore.updateEntity,
  createEntity: storeState.alterationStore.createEntity,
  reset: storeState.alterationStore.reset,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(AlterationForm);
