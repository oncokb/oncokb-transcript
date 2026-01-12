import React, { useEffect } from 'react';
import { AlterationData } from '../AddMutationModal';
import { AlterationTypeEnum } from 'app/shared/api/generated/curation';
import AddMutationModalField from './AddMutationModalField';
import AddMutationModalDropdown, { DropdownOption } from './AddMutationModalDropdown';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import _ from 'lodash';
import { Alert } from 'reactstrap';
import { READABLE_ALTERATION } from 'app/config/constants/constants';
import { getFullAlterationName, getMutationRenameValueFromName } from 'app/shared/util/utils';
import AnnotatedAlterationErrorContent from './AnnotatedAlterationErrorContent';
import { AddMutationModalDataTestIdType, getAddMutationModalDataTestId } from 'app/shared/util/test-id-utils';

const ALTERATION_TYPE_OPTIONS: DropdownOption[] = [
  AlterationTypeEnum.ProteinChange,
  AlterationTypeEnum.CopyNumberAlteration,
  AlterationTypeEnum.StructuralVariant,
  AlterationTypeEnum.CdnaChange,
  AlterationTypeEnum.GenomicChange,
  AlterationTypeEnum.Any,
].map(type => ({ label: READABLE_ALTERATION[type], value: type }));

export interface IMutationDetails extends StoreProps {
  alterationData: AlterationData;
  excludingIndex?: number;
}

const MutationDetails = ({
  alterationData,
  excludingIndex,
  getConsequences,
  consequences,
  selectedAlterationStateIndex,
  handleExcludingFieldChange,
  handleNormalFieldChange,
  isFetchingAlteration,
  isFetchingExcludingAlteration,
  handleAlterationChange,
}: IMutationDetails) => {
  useEffect(() => {
    getConsequences?.({});
  }, []);

  const consequenceOptions: DropdownOption[] =
    consequences?.map((consequence): DropdownOption => ({ label: consequence.name, value: consequence.id })) ?? [];

  if (alterationData === undefined || selectedAlterationStateIndex === undefined) return <></>;

  const alterationName = getMutationRenameValueFromName(alterationData.name) ?? '';

  const getProteinChangeContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
        <AddMutationModalField
          label="Protein Change"
          value={alterationData.proteinChange ?? ''}
          placeholder="Input protein change"
          onChange={newValue => handleFieldChange(newValue, 'proteinChange')}
        />
        <AddMutationModalField
          label="Protein Start"
          value={alterationData.proteinStart?.toString() || ''}
          placeholder="Input protein start"
          onChange={newValue => handleFieldChange(newValue, 'proteinStart')}
        />
        <AddMutationModalField
          label="Protein End"
          value={alterationData.proteinEnd?.toString() || ''}
          placeholder="Input protein end"
          onChange={newValue => handleFieldChange(newValue, 'proteinEnd')}
        />
        <AddMutationModalField
          label="Ref Residues"
          value={alterationData.refResidues || ''}
          placeholder="Input ref residues"
          onChange={newValue => handleFieldChange(newValue, 'refResidues')}
        />
        <AddMutationModalField
          label="Var Residues"
          value={alterationData.varResidues || ''}
          placeholder="Input var residues"
          onChange={newValue => handleFieldChange(newValue, 'varResidues')}
        />
        <AddMutationModalDropdown
          label="Consequence"
          value={consequenceOptions.find(option => option.label === alterationData.consequence) ?? { label: '', value: undefined }}
          options={consequenceOptions}
          menuPlacement="top"
          onChange={newValue => handleFieldChange(newValue?.label ?? '', 'consequence')}
        />
      </div>
    );
  };

  const getCdnaChangeContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
        <AddMutationModalField
          label="Protein Change"
          value={alterationData.proteinChange!}
          placeholder="Input protein change"
          onChange={newValue => handleFieldChange(newValue, 'proteinChange')}
        />
      </div>
    );
  };

  const getGenomicChangeContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
      </div>
    );
  };

  const getCopyNumberAlterationContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
      </div>
    );
  };

  const getStructuralVariantContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
        <AddMutationModalField
          label="Genes"
          value={alterationData.genes?.map(gene => gene.hugoSymbol).join(', ') ?? ''}
          placeholder="Input genes"
          disabled
          onChange={newValue => handleFieldChange(newValue, 'genes')}
        />
      </div>
    );
  };

  const getOtherContent = () => {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationName}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name')}
        />
      </div>
    );
  };

  const handleFieldChange = (newValue: string, field: keyof AlterationData) => {
    !_.isNil(excludingIndex)
      ? handleExcludingFieldChange?.(newValue, field)
      : handleNormalFieldChange?.(newValue, field, selectedAlterationStateIndex);
  };

  let content: JSX.Element;

  switch (alterationData.type) {
    case AlterationTypeEnum.ProteinChange:
      content = getProteinChangeContent();
      break;
    case AlterationTypeEnum.CopyNumberAlteration:
      content = getCopyNumberAlterationContent();
      break;
    case AlterationTypeEnum.CdnaChange:
      content = getCdnaChangeContent();
      break;
    case AlterationTypeEnum.GenomicChange:
      content = getGenomicChangeContent();
      break;
    case AlterationTypeEnum.StructuralVariant:
      content = getStructuralVariantContent();
      break;
    default:
      content = getOtherContent();
      break;
  }

  if (alterationData.error) {
    return (
      <AnnotatedAlterationErrorContent
        alterationData={alterationData}
        alterationIndex={selectedAlterationStateIndex}
        excludingIndex={excludingIndex}
      />
    );
  }

  return (
    <div data-testid={getAddMutationModalDataTestId(AddMutationModalDataTestIdType.MUTATION_DETAILS, alterationData.name)}>
      <h5>{excludingIndex !== undefined && excludingIndex > -1 ? 'Excluded Mutation Details' : 'Mutation Details'}</h5>
      {alterationData.warning && (
        <Alert color="warning" className="alteration-message" fade={false}>
          {alterationData.warning}
        </Alert>
      )}
      <AddMutationModalDropdown
        label="Type"
        options={ALTERATION_TYPE_OPTIONS}
        value={ALTERATION_TYPE_OPTIONS.find(option => option.value === alterationData.type) ?? { label: '', value: undefined }}
        onChange={newValue => handleFieldChange(newValue?.value, 'type')}
      />
      <AddMutationModalField
        label="Alteration"
        value={
          !_.isNil(alterationData.alterationFieldValueWhileFetching)
            ? alterationData.alterationFieldValueWhileFetching
            : getFullAlterationName(alterationData, !_.isNil(excludingIndex) ? false : true)
        }
        isLoading={_.isNil(excludingIndex) ? isFetchingAlteration : isFetchingExcludingAlteration}
        placeholder="Input alteration"
        onChange={newValue => handleAlterationChange?.(newValue, selectedAlterationStateIndex, excludingIndex)}
      />
      {content}
      <AddMutationModalField
        label="Comment"
        value={alterationData.comment}
        placeholder="Input comment"
        onChange={newValue => handleFieldChange(newValue, 'comment')}
      />
    </div>
  );
};

const mapStoreToProps = ({ consequenceStore, addMutationModalStore }: IRootStore) => ({
  consequences: consequenceStore.entities,
  getConsequences: consequenceStore.getEntities,
  alterationStates: addMutationModalStore.alterationStates,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  handleExcludingFieldChange: addMutationModalStore.handleExcludingFieldChange,
  handleNormalFieldChange: addMutationModalStore.handleNormalFieldChange,
  isFetchingAlteration: addMutationModalStore.isFetchingAlteration,
  isFetchingExcludingAlteration: addMutationModalStore.isFetchingExcludingAlteration,
  handleAlterationChange: addMutationModalStore.handleAlterationChange,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(MutationDetails);
