import React, { useEffect, useMemo, useState } from 'react';
import { IRootStore } from 'app/stores';
import { flow } from 'mobx';
import { componentInject } from 'app/shared/util/typed-inject';
import { ReferenceGenome } from 'app/shared/model/enumerations/reference-genome.model';
import { ProteinExonDTO } from 'app/shared/api/generated/curation';
import { Col, Row } from 'reactstrap';
import { components, OptionProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import _ from 'lodash';
import { parseAlterationName } from 'app/shared/util/utils';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { EXON_ALTERATION_REGEX } from 'app/config/constants/regex';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import classNames from 'classnames';

const ANY_EXON_REGEX = /Any Exon (\d+)(-\d+)? (Deletion|Insertion|Duplication)/i;

export interface IAddExonMutationModalBody extends StoreProps {
  hugoSymbol: string;
  defaultExonAlterationName?: string;
}

type ProteinExonDropdownOption = {
  label: string;
  value: { exon: ProteinExonDTO; name: string } | string;
  isSelected: boolean;
};

const EXON_CONSEQUENCES = ['Deletion', 'Insertion', 'Duplication'];

const AddExonForm = ({
  hugoSymbol,
  defaultExonAlterationName,
  getProteinExons,
  updateAlterationStateAfterAlterationAdded,
  setShowModifyExonForm,
  setAlterationStates,
  alterationStates,
  selectedAlterationStateIndex,
}: IAddExonMutationModalBody) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedExons, setSelectedExons] = useState<ProteinExonDropdownOption[]>([]);
  const [proteinExons, setProteinExons] = useState<ProteinExonDTO[]>([]);

  const [isPendingAddAlteration, setIsPendingAddAlteration] = useState(false);

  const exonOptions = useMemo(() => {
    const options: ProteinExonDropdownOption[] = EXON_CONSEQUENCES.flatMap(consequence => {
      return proteinExons.map(exon => {
        const name = `Exon ${exon.exon} ${consequence}`;
        return { label: `Exon ${exon.exon} ${consequence}`, value: { exon, name }, isSelected: false };
      });
    });
    return options;
  }, [proteinExons]);

  const defaultSelectedExons = useMemo(() => {
    if (!defaultExonAlterationName || exonOptions.length === 0) return [];
    const exonAltStrings = defaultExonAlterationName.split('+').map(s => s.trim());
    return exonAltStrings.reduce((acc, exonString) => {
      const match = exonString.match(EXON_ALTERATION_REGEX);
      if (match) {
        if (match[1].trim() === 'Any') {
          acc.push({ label: exonString, value: exonString, isSelected: true });
          return acc;
        }
        const startExon = parseInt(match[3], 10);
        const endExon = match[4] ? parseInt(match[5], 10) : startExon;
        const consequence = match[6];

        for (let exonNum = startExon; exonNum <= endExon; exonNum++) {
          const targetOption = exonOptions.find(option => option.label === `Exon ${exonNum} ${consequence}`);
          if (!targetOption) {
            notifyError(`Error parsing alteration: ${defaultExonAlterationName}`);
            return acc;
          }
          acc.push(targetOption);
        }
      }
      return acc;
    }, [] as ProteinExonDropdownOption[]);
  }, [defaultExonAlterationName, exonOptions]);

  useEffect(() => {
    setSelectedExons(defaultSelectedExons ?? []);
  }, [defaultSelectedExons]);

  const finalExonName = useMemo(() => {
    return selectedExons.map(option => option.label).join(' + ');
  }, [selectedExons]);

  useEffect(() => {
    getProteinExons?.(hugoSymbol, ReferenceGenome.GRCh37).then(value => setProteinExons(value));
  }, []);

  const standardizeAnyExonInputString = (createValue: string) => {
    if (ANY_EXON_REGEX.test(createValue)) {
      return createValue
        .split(' ')
        .map(part => _.capitalize(part))
        .join(' ');
    }
    return createValue;
  };

  const onCreateOption = (createInputValue: string) => {
    const value = standardizeAnyExonInputString(createInputValue);
    setSelectedExons(prevState => [...prevState, { label: value, value, isSelected: true }]);
  };

  async function handleAlterationAdded() {
    const parsedAlterations = parseAlterationName(finalExonName);
    try {
      setIsPendingAddAlteration(true);
      await updateAlterationStateAfterAlterationAdded?.(parsedAlterations, (defaultSelectedExons ?? []).length > 0);
    } finally {
      setIsPendingAddAlteration(false);
    }
    setShowModifyExonForm?.(false);
  }

  if (_.isNil(defaultSelectedExons)) {
    return <LoadingIndicator isLoading />;
  }

  return (
    <>
      <Row>
        <Col>
          <div className="h5">{(defaultSelectedExons?.length ?? 0) > 0 ? 'Modify Selected Exons' : 'Selected Exons'}</div>
        </Col>
      </Row>
      <Row className="d-flex align-items-center mb-3">
        <Col className={classNames(defaultSelectedExons.length > 0 ? 'col-9' : 'col-10')}>
          <CreatableSelect
            inputValue={inputValue}
            onInputChange={newValue => setInputValue(newValue)}
            options={exonOptions}
            value={selectedExons}
            onChange={newOptions => setSelectedExons(newOptions.map(option => ({ ...option, isSelected: true })))}
            components={{
              Option: MultiSelectOption,
              NoOptionsMessage,
            }}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            isClearable
            isValidNewOption={createInputValue => {
              return ANY_EXON_REGEX.test(createInputValue);
            }}
            onCreateOption={onCreateOption}
          />
        </Col>
        <Col className="text-end">
          <AsyncSaveButton
            isSavePending={isPendingAddAlteration}
            onClick={handleAlterationAdded}
            confirmText={defaultSelectedExons.length > 0 ? 'Update' : 'Add'}
            disabled={isPendingAddAlteration || selectedExons.length === 0}
          />
        </Col>
      </Row>
      {selectedExons.length > 0 && (
        <Row>
          <Col>
            <span className="text-muted">Name preview: {finalExonName}</span>
          </Col>
        </Row>
      )}
    </>
  );
};

const NoOptionsMessage = props => {
  return (
    <components.NoOptionsMessage {...props}>
      <div>No options</div>
      <div>Create a new option in the correct format:</div>
      <div className="text-primary">{'Any Exon start-end (Deletion|Insertion|Duplication)'}</div>
    </components.NoOptionsMessage>
  );
};

const MultiSelectOption = (props: OptionProps<ProteinExonDropdownOption>) => {
  return (
    <div>
      <components.Option {...props}>
        {(props.data as any).__isNew__ ? <></> : <input type="checkbox" checked={props.isSelected} onChange={() => null} />}{' '}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const mapStoreToProps = ({ transcriptStore, addMutationModalStore }: IRootStore) => ({
  getProteinExons: flow(transcriptStore.getProteinExons),
  updateAlterationStateAfterAlterationAdded: addMutationModalStore.updateAlterationStateAfterAlterationAdded,
  setShowModifyExonForm: addMutationModalStore.setShowModifyExonForm,
  alterationStates: addMutationModalStore.alterationStates,
  setAlterationStates: addMutationModalStore.setAlterationStates,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AddExonForm);
