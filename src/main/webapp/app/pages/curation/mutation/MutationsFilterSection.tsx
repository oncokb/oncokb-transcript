import { CHECKBOX_LABEL_LEFT_MARGIN } from 'app/config/constants/constants';
import { ONCOGENICITY_OPTIONS, MUTATION_EFFECT_OPTIONS, TX_LEVEL_OPTIONS } from 'app/config/constants/firebase';
import { Mutation } from 'app/shared/model/firebase/firebase.model';
import { getFilterModalStats, getMutationName } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Button, Col, Container, Input, InputGroup, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';

export interface IMutationsFilterSectionProps extends StoreProps {
  mutationsPath: string;
  filteredIndices: number[];
  setFilteredIndices: React.Dispatch<React.SetStateAction<number[]>>;
}

function MutationsFilterSection({ mutationsPath, filteredIndices, setFilteredIndices, firebaseDb }: IMutationsFilterSectionProps) {
  const [mutations, setMutations] = useState<Mutation[]>([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mutationFilter, setMutationFilter] = useState('');
  const [enabledCheckboxes, setEnabledCheckboxes] = useState<string[]>([]);

  const [oncogenicityFilter, setOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
  const [tempOncogenicityFilter, setTempOncogenicityFilter] = useState(initFilterCheckboxState(ONCOGENICITY_OPTIONS));

  const [mutationEffectFilter, setMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
  const [tempMutationEffectFilter, setTempMutationEffectFilter] = useState(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));

  const [txLevelFilter, setTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));
  const [tempTxLevelFilter, setTempTxLevelFilter] = useState(initFilterCheckboxState(TX_LEVEL_OPTIONS));

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, mutationsPath), snapshot => {
      setMutations(snapshot.val());
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const newFilteredIndices = mutations.reduce((accumulator: number[], mutation, index) => {
      const matchesName =
        !mutationFilter || getMutationName(mutation.name, mutation.alterations).toLowerCase().includes(mutationFilter.toLowerCase());

      const selectedOncogenicities = oncogenicityFilter.filter(filter => filter.selected);
      const matchesOncogenicity =
        selectedOncogenicities.length === 0 ||
        selectedOncogenicities.some(oncogenicity => oncogenicity.label === mutation.mutation_effect.oncogenic);

      const selectedMutationEffects = mutationEffectFilter.filter(filter => filter.selected);
      const matchesMutationEffect =
        selectedMutationEffects.length === 0 ||
        selectedMutationEffects.some(mutationEffect => mutationEffect.label === mutation.mutation_effect.effect);

      function matchesTxLevel() {
        const selectedTxLevels = txLevelFilter.filter(txLevel => txLevel.selected);
        if (selectedTxLevels.length === 0) {
          return true;
        }

        if (!mutation.tumors) {
          return false;
        }

        for (const tumor of mutation.tumors) {
          for (const TI of tumor.TIs) {
            if (!TI.treatments) {
              continue;
            }

            for (const treatment of TI.treatments) {
              if (selectedTxLevels.some(txLevel => txLevel.label === treatment.level)) {
                return true;
              }
            }
          }
        }
        return false;
      }

      if (matchesName && matchesOncogenicity && matchesMutationEffect && matchesTxLevel()) {
        return [...accumulator, index];
      }

      return accumulator;
    }, []);

    if (!_.isEqual(filteredIndices, newFilteredIndices)) {
      setFilteredIndices(newFilteredIndices);
    }
  }, [mutations, filteredIndices, mutationFilter, oncogenicityFilter, mutationEffectFilter, txLevelFilter]);

  const showFilterModalCancelButton = useMemo(() => {
    return (
      tempOncogenicityFilter.some(filter => filter.selected) ||
      tempMutationEffectFilter.some(filter => filter.selected) ||
      tempTxLevelFilter.some(filter => filter.selected)
    );
  }, [tempOncogenicityFilter, tempMutationEffectFilter, tempTxLevelFilter]);

  const mutationsAreFiltered = useMemo(() => {
    return (
      oncogenicityFilter.some(filter => filter.selected) ||
      mutationEffectFilter.some(filter => filter.selected) ||
      txLevelFilter.some(filter => filter.selected) ||
      mutationFilter
    );
  }, [oncogenicityFilter, mutationEffectFilter, txLevelFilter, mutationFilter]);

  useEffect(() => {
    const availableFilters = getFilterModalStats(mutations);
    setEnabledCheckboxes([...availableFilters.oncogencities, ...availableFilters.mutationEffects, ...availableFilters.txLevels]);
  }, [mutations]);

  function handleToggleFilterModal() {
    setShowFilterModal(showModal => !showModal);
  }

  function initFilterCheckboxState(options: string[]) {
    return options.map(option => ({ label: option, selected: false, disabled: false }));
  }

  function handleFilterCheckboxChange(
    index: number,
    setState: React.Dispatch<
      React.SetStateAction<
        {
          label: string;
          selected: boolean;
        }[]
      >
    >
  ) {
    setState(currentState =>
      currentState.map((filter, filterIndex) => {
        if (index === filterIndex) {
          return { label: filter.label, selected: !filter.selected };
        }
        return filter;
      })
    );
  }

  return (
    <>
      <div style={{ width: '100%' }} className="d-flex align-items-center justify-content-between mb-2">
        {mutationsAreFiltered ? <span>{`Showing ${filteredIndices.length} of ${mutations.length} matching the search`}</span> : <span />}
        <div className="d-flex align-items-center">
          <FaFilter
            color={mutationsAreFiltered ? 'gold' : null}
            style={{ cursor: 'pointer' }}
            onClick={handleToggleFilterModal}
            className="mr-2"
            id="filter"
          />
          <Input placeholder={'Search Mutation'} value={mutationFilter} onChange={event => setMutationFilter(event.target.value)} />
        </div>
      </div>
      <Modal isOpen={showFilterModal} toggle={handleToggleFilterModal}>
        <ModalHeader>
          <Container>
            <Row>
              <Col>Filters</Col>
            </Row>
          </Container>
        </ModalHeader>
        <ModalBody>
          <Container>
            <h6 className="mb-2">Oncogenicity</h6>
            <Row>
              {tempOncogenicityFilter.map((filter, index) => {
                const isDisabled = !enabledCheckboxes.includes(filter.label);
                return (
                  <Col className="col-6" key={filter.label}>
                    <InputGroup>
                      <Input
                        id={`oncogenicity-filter-${filter.label}`}
                        onChange={() => handleFilterCheckboxChange(index, setTempOncogenicityFilter)}
                        checked={filter.selected}
                        disabled={isDisabled}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                        type="checkbox"
                      />
                      <Label
                        for={`oncogenicity-filter-${filter.label}`}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                      >
                        {filter.label}
                      </Label>
                    </InputGroup>
                  </Col>
                );
              })}
            </Row>
            <h6 className="mb-2 mt-2">Mutation effect</h6>
            <Row>
              {tempMutationEffectFilter.map((filter, index) => {
                const isDisabled = !enabledCheckboxes.includes(filter.label);

                return (
                  <Col className="col-6" key={filter.label}>
                    <InputGroup>
                      <Input
                        id={`mutation-effect-filter-${filter.label}`}
                        onChange={() => handleFilterCheckboxChange(index, setTempMutationEffectFilter)}
                        checked={filter.selected}
                        disabled={isDisabled}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                        type="checkbox"
                      />
                      <Label
                        for={`mutation-effect-filter-${filter.label}`}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                      >
                        {filter.label}
                      </Label>
                    </InputGroup>
                  </Col>
                );
              })}
            </Row>
            <h6 className="mb-2 mt-2">Therapeutic levels</h6>
            <Row className="align-items-start justify-content-start">
              {tempTxLevelFilter.map((filter, index) => {
                const isDisabled = !enabledCheckboxes.includes(filter.label);

                return (
                  <Col style={{ flexGrow: 0 }} key={filter.label}>
                    <InputGroup>
                      <Input
                        id={`tx-level-filter-${filter.label}`}
                        onChange={() => handleFilterCheckboxChange(index, setTempTxLevelFilter)}
                        checked={filter.selected}
                        disabled={isDisabled}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                        type="checkbox"
                      />
                      <Label
                        for={`tx-level-filter-${filter.label}`}
                        style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: CHECKBOX_LABEL_LEFT_MARGIN }}
                      >
                        {filter.label}
                      </Label>
                    </InputGroup>
                  </Col>
                );
              })}
            </Row>
            <Row className="justify-content-end">
              {showFilterModalCancelButton && (
                <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
                  <Button
                    outline
                    color="danger"
                    onClick={() => {
                      setTempOncogenicityFilter(initFilterCheckboxState(ONCOGENICITY_OPTIONS));
                      setTempMutationEffectFilter(initFilterCheckboxState(MUTATION_EFFECT_OPTIONS));
                      setTempTxLevelFilter(initFilterCheckboxState(TX_LEVEL_OPTIONS));
                    }}
                  >
                    Reset
                  </Button>
                </Col>
              )}
              <Col className="px-0 mr-2" style={{ flexGrow: 0 }}>
                <Button
                  color="primary"
                  onClick={() => {
                    setOncogenicityFilter(tempOncogenicityFilter);
                    setMutationEffectFilter(tempMutationEffectFilter);
                    setTxLevelFilter(tempTxLevelFilter);
                    setShowFilterModal(false);
                  }}
                >
                  Confirm
                </Button>
              </Col>
              <Col className="px-0" style={{ flexGrow: 0 }}>
                <Button
                  color="secondary"
                  onClick={() => {
                    setTempOncogenicityFilter(oncogenicityFilter);
                    setTempMutationEffectFilter(mutationEffectFilter);
                    setTempTxLevelFilter(txLevelFilter);
                    setShowFilterModal(false);
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Container>
        </ModalBody>
      </Modal>
    </>
  );
}

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(MutationsFilterSection);
