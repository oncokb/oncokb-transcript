import { CHECKBOX_LABEL_LEFT_MARGIN, UPDATE_MUTATION_FILTERS_DEBOUNCE_MILLISECONDS } from 'app/config/constants/constants';
import { ONCOGENICITY_OPTIONS, MUTATION_EFFECT_OPTIONS, TX_LEVEL_OPTIONS } from 'app/config/constants/firebase';
import { FIREBASE_ONCOGENICITY, MetaReview, Mutation, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { getFilterModalStats, getMutationName, mutationNeedsReview } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaFilter, FaSort } from 'react-icons/fa';
import { Button, Col, Container, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import AddMutationButton from '../button/AddMutationButton';
import ReactSelect from 'react-select';
import * as styles from './styles.module.scss';
import classNames from 'classnames';
import { Unsubscribe } from 'firebase/database';

export interface IMutationsSectionHeaderProps extends StoreProps {
  hugoSymbol: string;
  mutationsPath: string;
  metaGeneReviewPath: string;
  filteredIndices: number[];
  setFilteredIndices: React.Dispatch<React.SetStateAction<number[]>>;
  showAddMutationModal: boolean;
  setShowAddMutationModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSortMethod: React.Dispatch<React.SetStateAction<SortOptions>>;
}

enum FilterType {
  ONCOGENICITY,
  MUTATION_EFFECT,
  TX_LEVEL,
  HOTSPOT,
  NEEDS_REVIEW,
}

type Filter = {
  type: FilterType;
  label: string;
  selected: boolean;
  disabled: boolean;
};

export enum SortOptions {
  DEFAULT = 'Default Sort',
  LAST_MODIFIED = 'Last Modified',
  POSITION_INCREASING = 'Position Increasing',
  POSITION_DECREASING = 'Position Decreasing',
  FIREBASE = 'Firebase',
}

const YES = 'Yes';
const NO = 'No';
const HOTSPOT_OPTIONS = [YES, NO];
const NEEDS_REVIEW_OPTIONS = [YES, NO];

function MutationsSectionHeader({
  hugoSymbol,
  mutationsPath,
  metaGeneReviewPath,
  filteredIndices,
  setFilteredIndices,
  showAddMutationModal,
  setShowAddMutationModal,
  setSortMethod,
  firebaseDb,
  annotatedAltsCache,
  readOnly,
}: IMutationsSectionHeaderProps) {
  const [mutationsInitialized, setMutationsInitialized] = useState(false);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [metaReview, setMetaReview] = useState<MetaReview | null>(null);

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

  const [needsReviewFilter, setNeedsReviewFilter] = useState(initFilterCheckboxState(FilterType.NEEDS_REVIEW, NEEDS_REVIEW_OPTIONS));
  const [tempNeedsReviewFilter, setTempNeedsReviewFilter] = useState(
    initFilterCheckboxState(FilterType.NEEDS_REVIEW, NEEDS_REVIEW_OPTIONS),
  );

  const sortSelectRef = useRef<HTMLDivElement>(null);

  const setMutationsDebounced = _.debounce((snapshot: DataSnapshot) => {
    setMutations(snapshot.val());
  }, UPDATE_MUTATION_FILTERS_DEBOUNCE_MILLISECONDS);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];

    callbacks.push(
      onValue(ref(firebaseDb, mutationsPath), snapshot => {
        if (mutationsInitialized) {
          setMutationsDebounced(snapshot);
        } else {
          setMutations(snapshot.val());
          setMutationsInitialized(true);
        }
      }),
    );
    callbacks.push(
      onValue(ref(firebaseDb, metaGeneReviewPath), snapshot => {
        setMetaReview(snapshot.val());
      }),
    );

    return () => callbacks.forEach(callback => callback?.());
  }, [mutationsInitialized, mutationsPath, metaGeneReviewPath]);

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
          selectedMutationEffects.some(mutationEffect => mutationEffect.label === (mutation.mutation_effect.effect as string));

        const selectedHotspot = hotspotFilter.filter(filter => filter.selected).map(option => option.label);

        // when the hotspot filter is selected, we only show hotspot mutations
        let isHotspotMatch = true;
        if (selectedHotspot.length > 0) {
          const uniqueHotspotStatus = annotatedAltsCache
            ?.get(hugoSymbol, [
              {
                alterations: mutation.alterations ?? [],
                name: mutation.name ?? '',
              },
            ])
            .map(result => result?.annotation?.hotspot?.hotspot);
          isHotspotMatch =
            !!uniqueHotspotStatus &&
            uniqueHotspotStatus.filter(status => {
              const mappedOption = status ? YES : NO;
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

        function matchesReview() {
          if (!metaReview) {
            return false;
          }

          const selectedReviews = needsReviewFilter.filter(filter => filter.selected);
          const needsReview = mutationNeedsReview(mutation, metaReview);

          if (selectedReviews.length === 0) {
            return true;
          } else if (selectedReviews.length > 1) {
            return false;
          } else if (selectedReviews[0].label === YES) {
            return needsReview;
          } else {
            return !needsReview;
          }
        }

        if (matchesName && matchesOncogenicity && matchesMutationEffect && matchesTxLevel() && isHotspotMatch && matchesReview()) {
          return [...accumulator, index];
        }

        return accumulator;
      }, []) || [];

    if (!_.isEqual(filteredIndices, newFilteredIndices)) {
      setFilteredIndices(newFilteredIndices);
    }
  }, [
    mutations,
    metaReview,
    filteredIndices,
    mutationFilter,
    oncogenicityFilter,
    mutationEffectFilter,
    txLevelFilter,
    hotspotFilter,
    needsReviewFilter,
  ]);

  const showFilterModalCancelButton = useMemo(() => {
    return (
      tempOncogenicityFilter.some(filter => filter.selected) ||
      tempMutationEffectFilter.some(filter => filter.selected) ||
      tempTxLevelFilter.some(filter => filter.selected) ||
      tempHotspotFilter.some(filter => filter.selected) ||
      tempNeedsReviewFilter.some(filter => filter.selected)
    );
  }, [tempOncogenicityFilter, tempMutationEffectFilter, tempTxLevelFilter, tempHotspotFilter, tempNeedsReviewFilter]);

  const mutationsAreFiltered = useMemo(() => {
    return (
      oncogenicityFilter.some(filter => filter.selected) ||
      mutationEffectFilter.some(filter => filter.selected) ||
      txLevelFilter.some(filter => filter.selected) ||
      mutationFilter ||
      hotspotFilter.some(filter => filter.selected) ||
      needsReviewFilter.some(filter => filter.selected)
    );
  }, [oncogenicityFilter, mutationEffectFilter, txLevelFilter, mutationFilter, hotspotFilter, needsReviewFilter]);

  useEffect(() => {
    const availableFilters = getFilterModalStats(mutations);
    setEnabledCheckboxes([
      ...availableFilters.oncogencities.map(option => getCheckboxUniqKey(FilterType.ONCOGENICITY, option)),
      ...availableFilters.mutationEffects.map(option => getCheckboxUniqKey(FilterType.MUTATION_EFFECT, option)),
      ...availableFilters.txLevels.map(option => getCheckboxUniqKey(FilterType.TX_LEVEL, option)),
      ...HOTSPOT_OPTIONS.map(option => getCheckboxUniqKey(FilterType.HOTSPOT, option)),
      ...NEEDS_REVIEW_OPTIONS.map(option => getCheckboxUniqKey(FilterType.NEEDS_REVIEW, option)),
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

  function initFilterCheckboxState(type: FilterType, options: string[]): Filter[] {
    return options.map(option => ({ type, label: option, selected: false, disabled: false }));
  }

  function handleFilterCheckboxChange(index: number, setState: React.Dispatch<React.SetStateAction<Filter[]>>) {
    setState(currentState =>
      currentState.map((filter, filterIndex) => {
        if (index === filterIndex) {
          return { ...filter, label: filter.label, selected: !filter.selected };
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
        disabled={readOnly}
      />
    );
  }

  function getCheckboxGroup(filter: Filter, onChange: () => void) {
    const isDisabled = !checkboxEnabled(filter.type, filter.label);

    return (
      <FormGroup check className={styles.formGroupCheck}>
        <Input
          className={styles.formCheckInput}
          id={`${filter.type}-${filter.label}`}
          onChange={onChange}
          checked={filter.selected}
          disabled={isDisabled}
          type="checkbox"
        />
        <Label className={classNames('form-check-label', styles.formCheckLabel)} for={`${filter.type}-${filter.label}`}>
          {filter.label}
        </Label>
      </FormGroup>
    );
  }

  return (
    <div className={'d-flex align-items-center mb-2 mt-4'}>
      <div className={'d-flex align-items-center mb-2'}>
        <h5 className="mb-0 me-2">Mutations:</h5>
        <AddMutationButton
          showAddMutationModal={showAddMutationModal}
          onClickHandler={(show: boolean) => setShowAddMutationModal(!show)}
          disabled={readOnly}
        />
      </div>
      <div style={{ width: '100%' }} className="d-flex align-items-center justify-content-between mb-2">
        {mutationsAreFiltered ? <span>{`Showing ${filteredIndices.length} of ${mutations.length} matching the search`}</span> : <span />}
        {mutations?.length > 0 && (
          <div className="d-flex align-items-center">
            <FaFilter
              color={mutationsAreFiltered ? 'gold' : undefined}
              style={{ cursor: 'pointer', minWidth: 15 }}
              onClick={handleToggleFilterModal}
              id="filter"
            />
            <div ref={sortSelectRef} className="mx-2" style={{ width: 320 }}>
              <ReactSelect
                defaultValue={{ label: SortOptions.DEFAULT, value: SortOptions.DEFAULT }}
                options={Object.values(SortOptions).map(option => ({ label: option, value: option }))}
                components={{
                  DropdownIndicator: () => <FaSort className="mx-1" />,
                }}
                classNames={{
                  control: () => 'border',
                }}
                onChange={newValue => {
                  if (newValue) {
                    setSortMethod(newValue.value);
                  }
                }}
              />
            </div>
            <Input
              style={{ minHeight: sortSelectRef.current?.clientHeight }}
              placeholder={'Search Mutation'}
              value={mutationFilter}
              onChange={event => setMutationFilter(event.target.value)}
            />
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
            <h6 className="mb-2 mt-2">Needs Review</h6>
            <Row className="align-items-start justify-content-start">
              {tempNeedsReviewFilter.map((filter, index) => {
                return (
                  <Col className="col-3" key={filter.label}>
                    {getCheckboxGroup(filter, () => handleFilterCheckboxChange(index, setTempNeedsReviewFilter))}
                  </Col>
                );
              })}
            </Row>
            <h6 className="mb-2">Oncogenicity</h6>
            <Row>
              {tempOncogenicityFilter.map((filter, index) => {
                return (
                  <Col className="col-6" key={filter.label}>
                    {getCheckboxGroup(filter, () => handleFilterCheckboxChange(index, setTempOncogenicityFilter))}
                  </Col>
                );
              })}
            </Row>
            <h6 className="mb-2 mt-2">Mutation effect</h6>
            <Row>
              {tempMutationEffectFilter.map((filter, index) => {
                return (
                  <Col className="col-6" key={filter.label}>
                    {getCheckboxGroup(filter, () => handleFilterCheckboxChange(index, setTempMutationEffectFilter))}
                  </Col>
                );
              })}
            </Row>
            <h6 className="mb-2 mt-2">Therapeutic levels</h6>
            <Row className="align-items-start justify-content-start">
              {tempTxLevelFilter.map((filter, index) => {
                return (
                  <Col className="col-2" key={filter.label}>
                    {getCheckboxGroup(filter, () => handleFilterCheckboxChange(index, setTempTxLevelFilter))}
                  </Col>
                );
              })}
            </Row>
            {!annotatedAltsCache?.loading && (
              <>
                <h6 className="mb-2 mt-2">Hotspot</h6>
                <Row className="align-items-start justify-content-start">
                  {tempHotspotFilter.map((filter, index) => {
                    return (
                      <Col className="col-3" key={filter.label}>
                        {getCheckboxGroup(filter, () => handleFilterCheckboxChange(index, setTempHotspotFilter))}
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
                      setTempNeedsReviewFilter(initFilterCheckboxState(FilterType.NEEDS_REVIEW, NEEDS_REVIEW_OPTIONS));
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
                    setNeedsReviewFilter(tempNeedsReviewFilter);
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
                    setTempNeedsReviewFilter(needsReviewFilter);
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
  readOnly: curationPageStore.readOnly,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(MutationsSectionHeader);
