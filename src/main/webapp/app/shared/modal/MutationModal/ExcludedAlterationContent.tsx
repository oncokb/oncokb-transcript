import { IRootStore } from 'app/stores';
import React, { useEffect, useMemo, useState } from 'react';
import { componentInject } from '../../util/typed-inject';
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import { getFullAlterationName, parseAlterationName } from '../../util/utils';
import { AlterationData } from '../NewAddMutationModal';
import { components, MultiValueGenericProps } from 'react-select';
import * as styles from './styles.module.scss';
import AnnotatedAlterationContent from './AnnotatedAlterationContent';
import { AsyncSaveButton } from 'app/shared/button/AsyncSaveButton';

export interface IExcludedAlterationContent extends StoreProps {}

const ExcludedAlterationContent = ({
  alterationStates,
  selectedAlterationStateIndex,
  updateAlterationStateAfterExcludedAlterationAdded,
  setAlterationStates,
}: IExcludedAlterationContent) => {
  const [excludingCollapsed, setExcludingCollapsed] = useState(false);
  const [excludingInputValue, setExcludingInputValue] = useState('');
  const [isAddExcludedAlterationPending, setIsAddExcludedAlterationPending] = useState(false);
  const [selectedExcludedAlteration, setSelectedExcludedAlteration] = useState<string | null>(null);

  if (alterationStates === undefined || selectedAlterationStateIndex === undefined) return <></>;

  const excludedAlterationIndex = useMemo(() => {
    const excludingArray = alterationStates[selectedAlterationStateIndex].excluding;
    return excludingArray.findIndex(ea => ea.alteration === selectedExcludedAlteration);
  }, [selectedExcludedAlteration]);

  const handleAlterationAddedExcluding = async () => {
    try {
      setIsAddExcludedAlterationPending(true);
      await updateAlterationStateAfterExcludedAlterationAdded?.(parseAlterationName(excludingInputValue));
    } finally {
      setIsAddExcludedAlterationPending(false);
    }
    setExcludingInputValue('');
  };

  const handleKeyDownExcluding = (event: React.KeyboardEvent<Element>) => {
    if (!excludingInputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      handleAlterationAddedExcluding();
      event.preventDefault();
    }
  };

  const isSectionEmpty = alterationStates[selectedAlterationStateIndex].excluding.length === 0;

  return (
    <>
      <div className="d-flex align-items-center mb-3">
        <Col className="col-3 me-3">
          <span className="me-2">Excluding</span>
          {!isSectionEmpty && (
            <>
              {excludingCollapsed ? (
                <FaChevronDown style={{ cursor: 'pointer' }} onClick={isSectionEmpty ? undefined : () => setExcludingCollapsed(false)} />
              ) : (
                <FaChevronUp style={{ cursor: 'pointer' }} onClick={() => setExcludingCollapsed(true)} />
              )}
            </>
          )}
        </Col>
        <Col className="px-0">
          <CreatableSelect
            components={{
              DropdownIndicator: null,
              MultiValueLabel: labelProps => <MultiValueLabel {...labelProps} onClick={label => setSelectedExcludedAlteration(label)} />,
            }}
            isMulti
            menuIsOpen={false}
            placeholder="Enter alteration(s)"
            inputValue={excludingInputValue}
            onInputChange={(newInput, { action }) => {
              if (action !== 'menu-close' && action !== 'input-blur') {
                setExcludingInputValue(newInput);
              }
            }}
            value={alterationStates[selectedAlterationStateIndex].excluding.map(state => {
              const fullAlterationName = getFullAlterationName(state, false);
              return { label: fullAlterationName, value: fullAlterationName, ...state };
            })}
            onChange={(newAlterations: readonly AlterationData[]) => {
              alterationStates[selectedAlterationStateIndex].excluding = alterationStates[selectedAlterationStateIndex].excluding.filter(
                state => newAlterations.some(alt => getFullAlterationName(alt) === getFullAlterationName(state)),
              );
              setAlterationStates?.(alterationStates);
            }}
            onKeyDown={handleKeyDownExcluding}
          />
        </Col>
        <Col className="col-auto ps-2 pe-0">
          <Button color="primary" disabled={!excludingInputValue} onClick={handleAlterationAddedExcluding}>
            <FaPlus />
          </Button>
        </Col>
      </div>
      {!isSectionEmpty && !excludingCollapsed && (
        <Row className="align-items-center">
          <Col>
            <AnnotatedAlterationContent
              alterationData={alterationStates[selectedAlterationStateIndex].excluding[excludedAlterationIndex]}
              excludingIndex={excludedAlterationIndex}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

interface CustomMultiValueLabelProps extends MultiValueGenericProps<AlterationData> {
  onClick: (label: string) => void;
}
const MultiValueLabel = (props: CustomMultiValueLabelProps) => {
  return (
    <div
      className={styles.excludedAlterationValueContainer}
      onClick={() => {
        props.onClick(props.data.label);
      }}
    >
      <components.MultiValueLabel {...props} />
    </div>
  );
};

const mapStoreToProps = ({ addMutationModalStore }: IRootStore) => ({
  alterationStates: addMutationModalStore.alterationStates,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  handleExcludingFieldChange: addMutationModalStore.handleExcludingFieldChange,
  isFetchingExcludingAlteration: addMutationModalStore.isFetchingExcludingAlteration,
  updateAlterationStateAfterExcludedAlterationAdded: addMutationModalStore.updateAlterationStateAfterExcludedAlterationAdded,
  setAlterationStates: addMutationModalStore.setAlterationStates,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(ExcludedAlterationContent);
