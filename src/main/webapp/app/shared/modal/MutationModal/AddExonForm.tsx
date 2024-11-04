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
import InfoIcon from 'app/shared/icons/InfoIcon';
import { FaArrowLeft } from 'react-icons/fa';
import * as styles from './styles.module.scss';

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
  setHasUncommitedExonFormChanges,
}: IAddExonMutationModalBody) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedExons, setSelectedExons] = useState<ProteinExonDropdownOption[]>([]);
  const [proteinExons, setProteinExons] = useState<ProteinExonDTO[]>([]);

  const [isPendingAddAlteration, setIsPendingAddAlteration] = useState(false);
  const [didRemoveProblematicAlt, setDidRemoveProblematicAlt] = useState(false);

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
        if (match[1]?.trim() === 'Any') {
          acc.push({ label: exonString, value: exonString, isSelected: true });
          return acc;
        }
        const startExon = parseInt(match[3], 10);
        const endExon = match[4] ? parseInt(match[5], 10) : startExon;
        const consequence = match[6];

        for (let exonNum = startExon; exonNum <= endExon; exonNum++) {
          const targetOption = exonOptions.find(option => option.label === `Exon ${exonNum} ${consequence}`);
          if (!targetOption) {
            notifyError(`Removed exon that does not exist: ${defaultExonAlterationName}`);
            setDidRemoveProblematicAlt(true);
          } else {
            acc.push({ ...targetOption, isSelected: true });
          }
        }
      }
      return acc;
    }, [] as ProteinExonDropdownOption[]);
  }, [defaultExonAlterationName, exonOptions]);

  const isUpdate = defaultSelectedExons.length > 0 || didRemoveProblematicAlt;

  useEffect(() => {
    setSelectedExons(defaultSelectedExons ?? []);
  }, [defaultSelectedExons]);

  const finalExonName = useMemo(() => {
    return selectedExons.map(option => option.label).join(' + ');
  }, [selectedExons]);

  useEffect(() => {
    getProteinExons?.(hugoSymbol, ReferenceGenome.GRCh37).then(value => setProteinExons(value));
  }, []);

  useEffect(() => {
    const updateDisabled = isPendingAddAlteration || selectedExons.length === 0 || _.isEqual(defaultSelectedExons, selectedExons);
    if (!updateDisabled) {
      setHasUncommitedExonFormChanges?.(true);
    }
  }, [isPendingAddAlteration, selectedExons, defaultSelectedExons]);

  const standardizeExonInputString = (createValue: string) => {
    if (EXON_ALTERATION_REGEX.test(createValue)) {
      return createValue
        .split(' ')
        .map(part => _.capitalize(part))
        .join(' ');
    }
    return createValue;
  };

  const onCreateOption = (createInputValue: string) => {
    const value = standardizeExonInputString(createInputValue);
    setSelectedExons(prevState => [...prevState, { label: value, value, isSelected: true }]);
  };

  async function handleAlterationAdded() {
    const parsedAlterations = parseAlterationName(finalExonName);
    try {
      setIsPendingAddAlteration(true);
      await updateAlterationStateAfterAlterationAdded?.(parsedAlterations, isUpdate);
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
      <Row className="mb-3">
        <Col>
          <div
            onClick={() => {
              setShowModifyExonForm?.(false);
              setHasUncommitedExonFormChanges?.(false);
            }}
            className={classNames('d-inline-flex align-items-center', styles.link)}
          >
            <FaArrowLeft className="me-1" /> Mutation List
          </div>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <div className="h5">{isUpdate ? 'Modify Selected Exons' : 'Selected Exons'}</div>
        </Col>
      </Row>
      <Row className="d-flex align-items-center mb-3">
        <Col className={classNames(isUpdate ? 'col-9' : 'col-10', 'pe-0')}>
          <Row>
            <Col className="col-11">
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
                  return EXON_ALTERATION_REGEX.test(createInputValue);
                }}
                onCreateOption={onCreateOption}
              />
            </Col>
            <Col className="col-1 d-flex align-items-center p-0">
              <InfoIcon overlay={EXON_CREATE_INFO} />
            </Col>
          </Row>
        </Col>
        <Col className="text-end">
          <AsyncSaveButton
            isSavePending={isPendingAddAlteration}
            onClick={handleAlterationAdded}
            confirmText={isUpdate ? 'Update' : 'Add'}
            disabled={isPendingAddAlteration || selectedExons.length === 0 || _.isEqual(defaultSelectedExons, selectedExons)}
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

const EXON_CREATE_INFO = (
  <>
    <div>You can create a new option that adheres to one of the formats:</div>
    <div>
      <ul>
        <li className="text-primary">
          {`Any Exon start-end (${EXON_CONSEQUENCES.join('|')})`}
          <InfoIcon
            className="ms-1"
            overlay={
              'This format refers to any combination of Exons between the range [start, end]. As long as one or more of the specified Exons are present, then the annotation will be pulled.'
            }
          />
        </li>
        <li className="text-primary">
          {`Exon start-end (${EXON_CONSEQUENCES.join('|')})`}
          <InfoIcon
            className="ms-1"
            overlay={
              'This format refers to Exons in the range [start, end]. For instance "Exon 2-4 Deletion" is equivalent to "Exon 2 Deletion + Exon 3 Deletion + Exon 4 Deletion"'
            }
          />
        </li>
      </ul>
    </div>
  </>
);

const NoOptionsMessage = props => {
  return (
    <components.NoOptionsMessage {...props}>
      <div style={{ textAlign: 'left' }}>
        <div>No options matching text</div>
        <br></br>
        {EXON_CREATE_INFO}
      </div>
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
  setHasUncommitedExonFormChanges: addMutationModalStore.setHasUncommitedExonFormChanges,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AddExonForm);
