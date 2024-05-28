import { CHECKBOX_LABEL_LEFT_MARGIN, UPDATE_MUTATION_FILTERS_DEBOUNCE_MILLISECONDS } from 'app/config/constants/constants';
import { ONCOGENICITY_OPTIONS, MUTATION_EFFECT_OPTIONS, TX_LEVEL_OPTIONS } from 'app/config/constants/firebase';
import { FIREBASE_ONCOGENICITY, Mutation, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getFilterModalStats, getMutationName } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FaFilter } from 'react-icons/fa';
import { Button, Col, Container, Input, InputGroup, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import AddMutationButton from '../button/AddMutationButton';

export interface IMutationsSectionHeaderProps extends StoreProps {
  hugoSymbol: string;
  mutationsPath: string;
  filteredIndices: number[];
  setFilteredIndices: React.Dispatch<React.SetStateAction<number[]>>;
  showAddMutationModal: boolean;
  setShowAddMutationModal: React.Dispatch<React.SetStateAction<boolean>>;
}

enum FilterType {
  ONCOGENICITY,
  MUTATION_EFFECT,
  TX_LEVEL,
  HOTSPOT,
  REVIEWED,
}

const HOTSPOT_OPTIONS = ['Yes', 'No'];
const REVIEWED_OPTIONS = ['Yes', 'No'];

function MutationsSectionHeader({
  hugoSymbol,
  mutationsPath,
  filteredIndices,
  setFilteredIndices,
  showAddMutationModal,
  setShowAddMutationModal,
  firebaseDb,
  annotatedAltsCache,
}: IMutationsSectionHeaderProps) {
  const [mutationsInitialized, setMutationsInitialized] = useState(false);
  const [mutations, setMutations] = useState<Mutation[]>([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mutationFilter, setMutationFilter] = useState('');
  const [enabledCheckboxes, setEnabledCheckboxes] = useState<string[]>([]);

  const [oncogenicityFilter, setOncogenicityFilter] = useState(initFilterCheckboxState(FilterType.ONCOGENICITY, ONCOGENICITY_OPTIONS));
  const [tempOncogenicityFilter, setTempOncogenicityFilter] = useState(
    initFilterCheckboxState(FilterType.ONCOGENICITY, ONCOGENICITY_OPTIONS),
  );

  const [mutationEffectFilter, setMutationEffectFilter] = useState(
    initFilterCheckboxState(FilterType.MUTATION_EFFECT, MUTATION_EFFECT_OPTIONS),
  );
  const [tempMutationEffectFilter, setTempMutationEffectFilter] = useState(
    initFilterCheckboxState(FilterType.MUTATION_EFFECT, MUTATION_EFFECT_OPTIONS),
  );

  const [txLevelFilter, setTxLevelFilter] = useState(initFilterCheckboxState(FilterType.TX_LEVEL, TX_LEVEL_OPTIONS));
  const [tempTxLevelFilter, setTempTxLevelFilter] = useState(initFilterCheckboxState(FilterType.TX_LEVEL, TX_LEVEL_OPTIONS));

  const [hotspotFilter, setHotspotFilter] = useState(initFilterCheckboxState(FilterType.HOTSPOT, HOTSPOT_OPTIONS));
  const [tempHotspotFilter, setTempHotspotFilter] = useState(initFilterCheckboxState(FilterType.HOTSPOT, HOTSPOT_OPTIONS));

  const [reviewedFilter, setReviewedFilter] = useState(initFilterCheckboxState(FilterType.REVIEWED, REVIEWED_OPTIONS));
  const [tempReviewedFilter, setTempReviewedFilter] = useState(initFilterCheckboxState(FilterType.REVIEWED, REVIEWED_OPTIONS));

  const setMutationsDebounced = _.debounce((snapshot: DataSnapshot) => {
    setMutations(snapshot.val());
  }, UPDATE_MUTATION_FILTERS_DEBOUNCE_MILLISECONDS);

  useEffect(() => {
    const unsubscribe = onValue(ref(firebaseDb, mutationsPath), snapshot => {
      if (mutationsInitialized) {
        setMutationsDebounced(snapshot);
      } else {
        setMutations(snapshot.val());
        setMutationsInitialized(true);
      }
    });

    return () => unsubscribe?.();
  }, [mutationsInitialized]);

  useEffect(() => {
    const newFilteredIndices =
      mutations?.reduce((accumulator: number[], mutation, index) => {
        const matchesName =
          !mutationFilter || getMutationName(mutation.name, mutation.alterations).toLowerCase().includes(mutationFilter.toLowerCase());

        const selectedOncogenicities = oncogenicityFilter.filter(filter => filter.selected);
        const matchesOncogenicity =
          selectedOncogenicities.length === 0 ||
          selectedOncogenicities.some(oncogenicity => (oncogenicity.label as FIREBASE_ONCOGENICITY) === mutation.mutation_effect.oncogenic);

        const selectedMutationEffects = mutationEffectFilter.filter(filter => filter.selected);
        const matchesMutationEffect =
          selectedMutationEffects.length === 0 ||
          selectedMutationEffects.some(mutationEffect => mutationEffect.label === mutation.mutation_effect.effect);

        const selectedHotspot = hotspotFilter.filter(filter => filter.selected).map(option => option.label);

        // when the hotspot filter is selected, we only show hotspot mutations
        let isHotspotMatch = true;
        if (selectedHotspot.length > 0) {
          const uniqueHotspotStatus = annotatedAltsCache
            .get(hugoSymbol, [
              {
                alterations: mutation.alterations,
                name: mutation.name,
              },
            ])
            .map(result => result.annotation?.hotspot?.hotspot);
          isHotspotMatch =
            uniqueHotspotStatus.filter(status => {
              const mappedOption = status ? 'Yes' : 'No';
              return selectedHotspot.includes(mappedOption);
            }).length > 0;
        }

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
                if (selectedTxLevels.some(txLevel => (txLevel.label as TX_LEVELS) === treatment.level)) {
                  return true;
                }
              }
            }
          }
          return false;
        }

        if (matchesName && matchesOncogenicity && matchesMutationEffect && matchesTxLevel() && isHotspotMatch) {
          return [...accumulator, index];
        }

        return accumulator;
      }, []) || [];

    if (!_.isEqual(filteredIndices, newFilteredIndices)) {
      setFilteredIndices(newFilteredIndices);
    }
  }, [mutations, filteredIndices, mutationFilter, oncogenicityFilter, mutationEffectFilter, txLevelFilter, hotspotFilter]);

  const showFilterModalCancelButton = useMemo(() => {
    return (
      tempOncogenicityFilter.some(filter => filter.selected) ||
      tempMutationEffectFilter.some(filter => filter.selected) ||
      tempTxLevelFilter.some(filter => filter.selected) ||
      tempHotspotFilter.some(filter => filter.selected)
    );
  }, [tempOncogenicityFilter, tempMutationEffectFilter, tempTxLevelFilter, tempHotspotFilter]);

  const mutationsAreFiltered = useMemo(() => {
    return (
      oncogenicityFilter.some(filter => filter.selected) ||
      mutationEffectFilter.some(filter => filter.selected) ||
      txLevelFilter.some(filter => filter.selected) ||
      mutationFilter ||
      hotspotFilter.some(filter => filter.selected)
    );
  }, [oncogenicityFilter, mutationEffectFilter, txLevelFilter, mutationFilter, hotspotFilter]);

  useEffect(() => {
    const availableFilters = getFilterModalStats(mutations);
    setEnabledCheckboxes([
      ...availableFilters.oncogencities.map(option => getCheckboxUniqKey(FilterType.ONCOGENICITY, option)),
      ...availableFilters.mutationEffects.map(option => getCheckboxUniqKey(FilterType.MUTATION_EFFECT, option)),
      ...availableFilters.txLevels.map(option => getCheckboxUniqKey(FilterType.TX_LEVEL, option)),
      ...HOTSPOT_OPTIONS.map(option => getCheckboxUniqKey(FilterType.HOTSPOT, option)),
      ...REVIEWED_OPTIONS.map(option => getCheckboxUniqKey(FilterType.HOTSPOT, option)),
    ]);
  }, [mutations]);

  const getCheckboxUniqKey = (type: FilterType, label: string) => {
    return `${type}-${label}`;
  };

  const checkboxEnabled = (type: FilterType, label: string) => {
    return enabledCheckboxes.includes(getCheckboxUniqKey(type, label));
  };

  function handleToggleFilterModal() {
    setShowFilterModal(showModal => !showModal);
  }

  function initFilterCheckboxState(type: FilterType, options: string[]) {
    return options.map(option => ({ type, label: option, selected: false, disabled: false }));
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
    >,
  ) {
    setState(currentState =>
      currentState.map((filter, filterIndex) => {
        if (index === filterIndex) {
          return { label: filter.label, selected: !filter.selected };
        }
        return filter;
      }),
    );
  }

  if (!mutations || mutations.length === 0) {
    return (
      <AddMutationButton
        showAddMutationModal={showAddMutationModal}
        onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
        showFullTitle
      />
    );
  }

  return (
    <div className={'d-flex align-items-center mb-2 mt-4'}>
      <div className={'d-flex align-items-center mb-2'}>
        <h5 className="mb-0 me-2">Mutations:</h5>
        <AddMutationButton showAddMutationModal={showAddMutationModal} onClickHandler={(show: boolean) => setShowAddMutationModal(!show)} />
      </div>
      <div style={{ width: '100%' }} className="d-flex align-items-center justify-content-between mb-2">
        {mutationsAreFiltered ? <span>{`Showing ${filteredIndices.length} of ${mutations.length} matching the search`}</span> : <span />}
        {mutations?.length > 0 && (
          <div className="d-flex align-items-center">
            <FaFilter
              color={mutationsAreFiltered ? 'gold' : null}
              style={{ cursor: 'pointer' }}
              onClick={handleToggleFilterModal}
              className="me-2"
              id="filter"
            />
            <Input placeholder={'Search Mutation'} value={mutationFilter} onChange={event => setMutationFilter(event.target.value)} />
          </div>
        )}
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
                const isDisabled = !checkboxEnabled(FilterType.ONCOGENICITY, filter.label);
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
                const isDisabled = !checkboxEnabled(FilterType.MUTATION_EFFECT, filter.label);

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
                const isDisabled = !checkboxEnabled(FilterType.TX_LEVEL, filter.label);

                return (
                  <Col className="col-2" key={filter.label}>
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
            <h6 className="mb-2 mt-2">Reviewed</h6>
            <Row className="align-items-start justify-content-start">
              {tempReviewedFilter.map((filter, index) => {
                const isDisabled = !checkboxEnabled(FilterType.REVIEWED, filter.label);

                return (
                  <Col className="col-2" key={filter.label}>
                    <InputGroup>
                      <Input
                        id={`tx-level-filter-${filter.label}`}
                        onChange={() => handleFilterCheckboxChange(index, setTempReviewedFilter)}
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
            {!annotatedAltsCache.loading && (
              <>
                <h6 className="mb-2 mt-2">Hotspot</h6>
                <Row className="align-items-start justify-content-start">
                  {tempHotspotFilter.map((filter, index) => {
                    const isDisabled = !checkboxEnabled(FilterType.HOTSPOT, filter.label);

                    return (
                      <Col style={{ flexGrow: 0 }} key={filter.label}>
                        <InputGroup>
                          <Input
                            id={`hotspot-filter-${filter.label}`}
                            onChange={() => handleFilterCheckboxChange(index, setTempHotspotFilter)}
                            checked={filter.selected}
                            disabled={isDisabled}
                            style={{ cursor: `${isDisabled ? null : 'pointer'}`, marginLeft: '0px' }}
                            type="checkbox"
                          />
                          <Label
                            for={`hotspot-filter-${filter.label}`}
                            style={{
                              cursor: `${isDisabled ? null : 'pointer'}`,
                              marginLeft: CHECKBOX_LABEL_LEFT_MARGIN,
                            }}
                          >
                            {filter.label}
                          </Label>
                        </InputGroup>
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
            <Row className="justify-content-end">
              {showFilterModalCancelButton && (
                <Col className="px-0 me-2" style={{ flexGrow: 0 }}>
                  <Button
                    outline
                    color="danger"
                    onClick={() => {
                      setTempOncogenicityFilter(initFilterCheckboxState(FilterType.ONCOGENICITY, ONCOGENICITY_OPTIONS));
                      setTempMutationEffectFilter(initFilterCheckboxState(FilterType.MUTATION_EFFECT, MUTATION_EFFECT_OPTIONS));
                      setTempTxLevelFilter(initFilterCheckboxState(FilterType.TX_LEVEL, TX_LEVEL_OPTIONS));
                      setTempHotspotFilter(initFilterCheckboxState(FilterType.HOTSPOT, HOTSPOT_OPTIONS));
                    }}
                  >
                    Reset
                  </Button>
                </Col>
              )}
              <Col className="px-0 me-2" style={{ flexGrow: 0 }}>
                <Button
                  color="primary"
                  onClick={() => {
                    setOncogenicityFilter(tempOncogenicityFilter);
                    setMutationEffectFilter(tempMutationEffectFilter);
                    setTxLevelFilter(tempTxLevelFilter);
                    setHotspotFilter(tempHotspotFilter);
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
                    setTempHotspotFilter(hotspotFilter);
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
    </div>
  );
}

const mapStoreToProps = ({ firebaseAppStore, curationPageStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  annotatedAltsCache: curationPageStore.annotatedAltsCache,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(MutationsSectionHeader);
