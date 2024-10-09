import { IRootStore } from 'app/stores';
import React, { useState } from 'react';
import { componentInject } from '../../util/typed-inject';
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa';
import { Button, Col, Row } from 'reactstrap';
import { parseAlterationName } from '../../util/utils';
import MutationDetails from './MutationDetails';
import _ from 'lodash';
import AlterationBadgeList from './AlterationBadgeList';

export interface IExcludedAlterationContent extends StoreProps {}

const ExcludedAlterationContent = ({
  alterationStates,
  selectedAlterationStateIndex,
  updateAlterationStateAfterExcludedAlterationAdded,
  selectedExcludedAlterationIndex,
}: IExcludedAlterationContent) => {
  const [excludingCollapsed, setExcludingCollapsed] = useState(false);
  const [excludingInputValue, setExcludingInputValue] = useState('');

  if (alterationStates === undefined || selectedAlterationStateIndex === undefined) return <></>;

  const handleAlterationAddedExcluding = () => {
    updateAlterationStateAfterExcludedAlterationAdded?.(parseAlterationName(excludingInputValue));
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
          <AlterationBadgeList
            isExclusionList
            showInput
            inputValue={excludingInputValue}
            onInputChange={newValue => setExcludingInputValue(newValue)}
            onKeyDown={handleKeyDownExcluding}
          />
        </Col>
        <Col className="col-auto ps-2 pe-0">
          <Button color="primary" disabled={!excludingInputValue} onClick={handleAlterationAddedExcluding}>
            <FaPlus />
          </Button>
        </Col>
      </div>
      {!isSectionEmpty && !excludingCollapsed && selectedExcludedAlterationIndex !== undefined && (
        <Row className="align-items-center">
          <Col>
            <MutationDetails
              alterationData={alterationStates[selectedAlterationStateIndex].excluding[selectedExcludedAlterationIndex]}
              excludingIndex={selectedExcludedAlterationIndex}
            />
          </Col>
        </Row>
      )}
    </>
  );
};

const mapStoreToProps = ({ addMutationModalStore }: IRootStore) => ({
  alterationStates: addMutationModalStore.alterationStates,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  handleExcludingFieldChange: addMutationModalStore.handleExcludingFieldChange,
  isFetchingExcludingAlteration: addMutationModalStore.isFetchingExcludingAlteration,
  updateAlterationStateAfterExcludedAlterationAdded: addMutationModalStore.updateAlterationStateAfterExcludedAlterationAdded,
  setAlterationStates: addMutationModalStore.setAlterationStates,
  selectedExcludedAlterationIndex: addMutationModalStore.selectedExcludedAlterationIndex,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(ExcludedAlterationContent);
