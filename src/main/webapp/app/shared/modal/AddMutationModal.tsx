import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { flow } from 'mobx';
import React, { KeyboardEventHandler, useEffect, useState } from 'react';
import { Col, Input, InputGroup, InputGroupText, Row } from 'reactstrap';
import { Mutation, AlterationCategories } from '../model/firebase/firebase.model';
import { AlterationAnnotationStatus, AlterationTypeEnum, Gene } from '../api/generated/curation';
import { getDuplicateMutations, getFirebaseGenePath, getFirebaseVusPath } from '../util/firebase/firebase-utils';
import { componentInject } from '../util/typed-inject';
import {
  isEqualIgnoreCase,
  parseAlterationName,
  convertEntityStatusAlterationToAlterationData,
  convertAlterationDataToAlteration,
  convertAlterationToAlterationData,
  convertIFlagToFlag,
} from '../util/utils';
import { DefaultAddMutationModal } from './DefaultAddMutationModal';
import './add-mutation-modal.scss';
import { Unsubscribe } from 'firebase/database';
import InfoIcon from '../icons/InfoIcon';
import { SopPageLink } from '../links/SopPageLink';
import {
  AlterationData,
  convertAlterationDataToAlteration,
  convertEntityStatusAlterationToAlterationData,
  getFullAlterationName,
} from '../util/alteration-utils';

interface IAddMutationModalProps extends StoreProps {
  hugoSymbol: string | undefined;
  isGermline: boolean;
  onConfirm: (mutation: Mutation) => Promise<void>;
  onCancel: () => void;
  mutationToEditPath?: string | null;
  convertOptions?: {
    alteration: string;
    isConverting: boolean;
  };
}

type MutationExistsMeta = {
  exists: boolean;
  inMutationList: boolean;
  inVusList: boolean;
};

function AddMutationModal({
  hugoSymbol,
  isGermline,
  mutationToEditPath,
  mutationList,
  geneEntities,
  onConfirm,
  onCancel,
  firebaseDb,
  convertOptions,
  getFlagsByType,
  createFlagEntity,
  alterationCategoryFlagEntities,
  setVusList,
  setMutationToEdit,
  alterationStates,
  vusList,
  mutationToEdit,
  setShowModifyExonForm,
  isFetchingAlteration,
  isFetchingExcludingAlteration,
  currentMutationNames,
  cleanup,
  fetchAlterations,
  setAlterationStates,
  selectedAlterationCategoryFlags,
  alterationCategoryComment,
  setGeneEntity,
  updateAlterationStateAfterAlterationAdded,
  selectedAlterationStateIndex,
  hasUncommitedExonFormChanges,
  unCommittedExonFormChangesWarning,
}: IAddMutationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [mutationAlreadyExists, setMutationAlreadyExists] = useState<MutationExistsMeta>({
    exists: false,
    inMutationList: false,
    inVusList: false,
  });

  const [isAddAlterationPending, setIsAddAlterationPending] = useState(false);

  const [errorMessagesEnabled, setErrorMessagesEnabled] = useState(true);
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, getFirebaseVusPath(isGermline, hugoSymbol)), snapshot => {
        setVusList?.(snapshot.val());
      }),
    );

    if (mutationToEditPath) {
      callbacks.push(
        onValue(ref(firebaseDb, mutationToEditPath), snapshot => {
          setMutationToEdit?.(snapshot.val());
        }),
      );
    }

    getFlagsByType?.(FlagTypeEnum.ALTERATION_CATEGORY);

    return () => callbacks.forEach(callback => callback?.());
  }, []);

  useEffect(() => {
    const geneEntity = geneEntities?.find(gene => gene.hugoSymbol === hugoSymbol);
    setGeneEntity?.(geneEntity ?? null);
  }, [geneEntities]);

  useEffect(() => {
    if (convertOptions?.isConverting) {
      handleAlterationAdded();
    }
  }, [convertOptions?.isConverting]);

  useEffect(() => {
    const dupMutations = getDuplicateMutations(
      currentMutationNames ?? [],
      mutationList,
      `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`,
      vusList ?? {},
      {
        useFullAlterationName: true,
        excludedMutationUuid: mutationToEdit?.name_uuid,
        excludedVusName: convertOptions?.isConverting ? convertOptions.alteration : '',
        exact: true,
      },
    );
    setMutationAlreadyExists({
      exists: dupMutations.length > 0,
      inMutationList: dupMutations.some(mutation => mutation.inMutationList),
      inVusList: dupMutations.some(mutation => mutation.inVusList),
    });
  }, [alterationStates, mutationList, vusList]);

  useEffect(() => {
    async function setExistingAlterations() {
      /* eslint-disable no-console */
      if (mutationToEdit?.alterations?.length !== undefined && mutationToEdit.alterations.length > 0) {
        // Use the alteration model in Firebase instead of annotation from API
        setAlterationStates?.(mutationToEdit?.alterations?.map(alt => convertAlterationToAlterationData(alt)) ?? []);
        return;
      }

      const parsedAlterations = mutationToEdit?.name?.split(',').reduce(
        (acc, name) => {
          const parsed = parseAlterationName(name.trim(), true);
          return acc.concat(parsed);
        },
        [] as ReturnType<typeof parseAlterationName>,
      );

      const entityStatusAlterationsPromise = fetchAlterations?.(parsedAlterations?.map(alt => alt.alteration) ?? []);
      if (!entityStatusAlterationsPromise) return;
      const excludingEntityStatusAlterationsPromises: Promise<AlterationAnnotationStatus[]>[] = [];
      for (const alt of parsedAlterations ?? []) {
        const fetchedAlterations = fetchAlterations?.(alt.excluding);
        if (fetchedAlterations) {
          excludingEntityStatusAlterationsPromises.push(fetchedAlterations);
        }
      }
      const [entityStatusAlterations, entityStatusExcludingAlterations] = await Promise.all([
        entityStatusAlterationsPromise,
        Promise.all(excludingEntityStatusAlterationsPromises),
      ]);

      const excludingAlterations: AlterationData[][] = [];
      if (parsedAlterations) {
        for (let i = 0; i < parsedAlterations.length; i++) {
          const excluding: AlterationData[] = [];
          for (let exIndex = 0; exIndex < parsedAlterations[i].excluding.length; exIndex++) {
            excluding.push(convertEntityStatusAlterationToAlterationData(entityStatusExcludingAlterations[i][exIndex], [], ''));
          }
          excludingAlterations.push(excluding);
        }
      }

      if (parsedAlterations) {
        const newAlerationStates = entityStatusAlterations.map((alt, index) =>
          convertEntityStatusAlterationToAlterationData(
            alt,
            excludingAlterations[index] || [],
            parsedAlterations[index].comment,
            parsedAlterations[index].name,
          ),
        );

        setAlterationStates?.(newAlerationStates);
      }
    }

    if (mutationToEdit) {
      setExistingAlterations();
    }
  }, [mutationToEdit]);

  async function handleAlterationAdded() {
    let alterationString = inputValue;
    if (convertOptions?.isConverting) {
      alterationString = convertOptions.alteration;
    }
    try {
      setIsAddAlterationPending(true);
      await updateAlterationStateAfterAlterationAdded?.(parseAlterationName(alterationString, true));
    } finally {
      setIsAddAlterationPending(false);
    }
    setInputValue('');
  }

  async function fetchAlteration(alterationName: string): Promise<AlterationAnnotationStatus | undefined> {
    try {
      const request: AnnotateAlterationBody[] = [
        {
          referenceGenome: REFERENCE_GENOME.GRCH37,
          alteration: { alteration: alterationName, genes: [{ id: geneEntity?.id } as Gene] } as ApiAlteration,
        },
      ];
      const alts = await flowResult(annotateAlterations?.(request));
      return alts[0];
    } catch (error) {
      notifyError(error);
    }
  }

  async function fetchAlterations(alterationNames: string[]) {
    try {
      const alterationPromises = alterationNames.map(name => fetchAlteration(name));
      const alterations = await Promise.all(alterationPromises);
      const filtered: AlterationAnnotationStatus[] = [];
      for (const alteration of alterations) {
        if (alteration !== undefined) {
          filtered.push(alteration);
        }
      }
      return filtered;
    } catch (error) {
      notifyError(error);
      return [];
    }
  }

  async function handleAlterationCategoriesConfirm() {
    let newAlterationCategories: AlterationCategories | null = new AlterationCategories();
    if (selectedAlterationCategoryFlags?.length === 0 || alterationStates?.length === 1) {
      newAlterationCategories = null;
    } else {
      newAlterationCategories.comment = alterationCategoryComment ?? '';
      const finalFlagArray = await saveNewFlags();
      if ((selectedAlterationCategoryFlags ?? []).length > 0) {
        newAlterationCategories.flags = finalFlagArray.map(flag => convertIFlagToFlag(flag));
      }
    }

    // Refresh flag entities
    await getFlagsByType?.(FlagTypeEnum.ALTERATION_CATEGORY);

    return newAlterationCategories;
  }

  async function saveNewFlags() {
    const [newFlags, oldFlags] = _.partition(selectedAlterationCategoryFlags ?? [], newFlag => {
      return !alterationCategoryFlagEntities?.some(existingFlag => {
        return newFlag.type === existingFlag.type && newFlag.flag === existingFlag.flag;
      });
    });
    if (newFlags.length > 0) {
      for (const newFlag of newFlags) {
        const savedFlagEntity = await createFlagEntity?.({
          type: FlagTypeEnum.ALTERATION_CATEGORY,
          flag: newFlag.flag,
          name: newFlag.name,
          description: '',
          alterations: null,
          genes: null,
          transcripts: null,
          articles: null,
          drugs: null,
        });
        if (savedFlagEntity?.data) {
          oldFlags.push(savedFlagEntity.data);
        }
      }
    }

    return oldFlags;
  }

  const handleKeyDown: KeyboardEventHandler = event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      handleAlterationAdded();
      event.preventDefault();
    }
  };

  async function handleAlterationAddedExcluding(alterationIndex: number) {
    const newParsedAlteration = parseAlterationName(excludingInputValue);

    const currentState = tabStates[alterationIndex];
    const alteration = currentState.alteration.toLowerCase();
    let excluding = currentState.excluding.map(ex => ex.alteration.toLowerCase());
    excluding.push(...newParsedAlteration.map(alt => alt.alteration.toLowerCase()));
    excluding = excluding.sort();

    if (
      tabStates.some(
        state =>
          state.alteration.toLowerCase() === alteration &&
          _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding),
      )
    ) {
      notifyError(new Error('Duplicate alteration(s) removed'));
      return;
    }

    const newComment = newParsedAlteration[0].comment;
    const newVariantName = newParsedAlteration[0].name;

    const newEntityStatusAlterations = await fetchAlterations(newParsedAlteration.map(alt => alt.alteration));

    const newAlterations = newEntityStatusAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[index].alteration, [], newComment, newVariantName),
    );

    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex].excluding.push(...newAlterations);
      return newStates;
    });

    setExcludingInputValue('');
  }

  const handleKeyDownExcluding = (event: React.KeyboardEvent<Element>, alterationIndex: number) => {
    if (!excludingInputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      handleAlterationAddedExcluding(alterationIndex);
      event.preventDefault();
    }
  };

  function getTabTitle(tabAlterationData: AlterationData, isExcluding = false) {
    if (!tabAlterationData) {
      // loading state
      return <></>;
    }

    const fullAlterationName = getFullAlterationName(tabAlterationData, isExcluding ? false : true);

    if (tabAlterationData.error) {
      return (
        <span>
          <FaExclamationTriangle className="text-danger me-1 mb-1" />
          {fullAlterationName}
        </span>
      );
    }

    if (tabAlterationData.warning) {
      return (
        <span>
          <FaExclamationTriangle className="text-warning me-1 mb-1" />
          {fullAlterationName}
        </span>
      );
    }

    return fullAlterationName;
  }

  function getTabContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    const excludingSection =
      !_.isNil(excludingIndex) || alterationData.type === 'GENOMIC_CHANGE' ? <></> : getExcludingSection(alterationData, alterationIndex);

    let content: JSX.Element;
    switch (alterationData.type) {
      case AlterationTypeEnum.ProteinChange:
        content = getProteinChangeContent(alterationData, alterationIndex, excludingIndex);
        break;
      case AlterationTypeEnum.CopyNumberAlteration:
        content = getCopyNumberAlterationContent(alterationData, alterationIndex, excludingIndex);
        break;
      case AlterationTypeEnum.CdnaChange:
        content = getCdnaChangeContent(alterationData, alterationIndex, excludingIndex);
        break;
      case AlterationTypeEnum.GenomicChange:
        content = getGenomicChangeContent(alterationData, alterationIndex, excludingIndex);
        break;
      case AlterationTypeEnum.StructuralVariant:
        content = getStructuralVariantContent(alterationData, alterationIndex, excludingIndex);
        break;
      default:
        content = getOtherContent(alterationData, alterationIndex, excludingIndex);
        break;
    }

    if (alterationData.error) {
      return getErrorSection(alterationData, alterationIndex, excludingIndex);
    }

    return (
      <>
        {alterationData.warning && (
          <Alert color="warning" className="alteration-message" fade={false}>
            {alterationData.warning}
          </Alert>
        )}
        <AddMutationModalDropdown
          label="Type"
          options={typeOptions}
          value={typeOptions.find(option => option.value === alterationData.type) ?? { label: '', value: undefined }}
          onChange={newValue => handleFieldChange(newValue?.value, 'type', alterationIndex, excludingIndex)}
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
          onChange={newValue => handleAlterationChange(newValue, alterationIndex, excludingIndex)}
        />
        {content}
        <AddMutationModalField
          label="Comment"
          value={alterationData.comment}
          placeholder="Input comment"
          onChange={newValue => handleFieldChange(newValue, 'comment', alterationIndex, excludingIndex)}
        />
        {excludingSection}
      </>
    );
  }

  function getProteinChangeContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Protein Change"
          value={alterationData.proteinChange ?? ''}
          placeholder="Input protein change"
          onChange={newValue => handleFieldChange(newValue, 'proteinChange', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Protein Start"
          value={alterationData.proteinStart?.toString() || ''}
          placeholder="Input protein start"
          onChange={newValue => handleFieldChange(newValue, 'proteinStart', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Protein End"
          value={alterationData.proteinEnd?.toString() || ''}
          placeholder="Input protein end"
          onChange={newValue => handleFieldChange(newValue, 'proteinEnd', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Ref Residues"
          value={alterationData.refResidues || ''}
          placeholder="Input ref residues"
          onChange={newValue => handleFieldChange(newValue, 'refResidues', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Var residues"
          value={alterationData.varResidues || ''}
          placeholder="Input var residues"
          onChange={newValue => handleFieldChange(newValue, 'varResidues', alterationIndex, excludingIndex)}
        />
        <AddMutationModalDropdown
          label="Consequence"
          value={consequenceOptions.find(option => option.label === alterationData.consequence) ?? { label: '', value: undefined }}
          options={consequenceOptions}
          menuPlacement="top"
          onChange={newValue => handleFieldChange(newValue?.label ?? '', 'consequence', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getCdnaChangeContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Protein Change"
          value={alterationData.proteinChange!}
          placeholder="Input protein change"
          onChange={newValue => handleFieldChange(newValue, 'proteinChange', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getGenomicChangeContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getCopyNumberAlterationContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getStructuralVariantContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Genes"
          value={alterationData.genes?.map(gene => gene.hugoSymbol).join(', ') ?? ''}
          placeholder="Input genes"
          disabled
          onChange={newValue => handleFieldChange(newValue, 'genes', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getOtherContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
        />
      </div>
    );
  }

  function getExcludingSection(alterationData: AlterationData, alterationIndex: number) {
    const isSectionEmpty = alterationData.excluding.length === 0;

    return (
      <>
        <div className="d-flex align-items-center mb-3">
          <Col className="px-0 col-3 me-3">
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
              value={tabStates[alterationIndex].excluding.map(state => {
                const fullAlterationName = getFullAlterationName(state, false);
                return { label: fullAlterationName, value: fullAlterationName, ...state };
              })}
              onChange={(newAlterations: readonly AlterationData[]) =>
                setTabStates(states => {
                  const newStates = _.cloneDeep(states);
                  newStates[alterationIndex].excluding = newStates[alterationIndex].excluding.filter(state =>
                    newAlterations.some(alt => getFullAlterationName(alt) === getFullAlterationName(state)),
                  );
                  return newStates;
                })
              }
              onKeyDown={event => handleKeyDownExcluding(event, alterationIndex)}
            />
          </Col>
          <Col className="col-auto ps-2 pe-0">
            <Button color="primary" disabled={!excludingInputValue} onClick={() => handleAlterationAddedExcluding(alterationIndex)}>
              <FaPlus />
            </Button>
          </Col>
        </div>
        {!isSectionEmpty && (
          <Row className="align-items-center">
            <Col className="px-0">
              <div className="pe-3">
                <Tabs
                  tabs={alterationData.excluding.map((ex, index) => ({
                    title: getTabTitle(ex, true),
                    content: getTabContent(ex, alterationIndex, index),
                  }))}
                  isCollapsed={excludingCollapsed}
                />
              </div>
            </Col>
          </Row>
        )}
      </>
    );
  }

  const mutationModalBody = (
    <div>
      {!convertOptions?.isConverting && renderInputSection()}
      {renderMutationListSection()}
      {renderMutationDetailSection()}
    </div>
  );

  const modalErrorMessage = getModalErrorMessage(mutationAlreadyExists);

  const modalWarningMessage: string[] = [];
  if (convertOptions?.isConverting && !isEqualIgnoreCase(convertOptions.alteration, (currentMutationNames ?? []).join(', '))) {
    modalWarningMessage.push('Name differs from original VUS name');
  }
  if (hasUncommitedExonFormChanges && unCommittedExonFormChangesWarning) {
    modalWarningMessage.push(unCommittedExonFormChangesWarning);
  }

  return (
    <DefaultAddMutationModal
      isUpdate={!!mutationToEdit}
      modalHeader={convertOptions?.isConverting ? <div>Promoting Variant(s) to Mutation</div> : undefined}
      modalBody={modalBody}
      onCancel={onCancel}
      onConfirm={async () => {
        const newMutation = mutationToEdit ? _.cloneDeep(mutationToEdit) : new Mutation('');
        const newAlterations = tabStates.map(state => convertAlterationDataToAlteration(state));
        newMutation.name = newAlterations.map(alteration => alteration.name).join(', ');
        newMutation.alterations = newAlterations;

        setErrorMessagesEnabled(false);
        setIsConfirmPending(true);
        try {
          await onConfirm(newMutation);
        } finally {
          setErrorMessagesEnabled(true);
          setIsConfirmPending(false);
        }
      }}
      errorMessages={modalErrorMessage && errorMessagesEnabled ? [modalErrorMessage] : undefined}
      warningMessages={modalWarningMessage ? modalWarningMessage : undefined}
      confirmButtonDisabled={
        alterationStates?.length === 0 ||
        mutationAlreadyExists.exists ||
        isFetchingAlteration ||
        isFetchingExcludingAlteration ||
        alterationStates?.some(tab => tab.error || tab.excluding.some(ex => ex.error)) ||
        isConfirmPending ||
        (hasUncommitedExonFormChanges ?? false)
      }
      isConfirmPending={isConfirmPending}
    />
  );
}

const mapStoreToProps = ({
  alterationStore,
  consequenceStore,
  geneStore,
  firebaseAppStore,
  firebaseVusStore,
  firebaseMutationListStore,
  flagStore,
  addMutationModalStore,
  transcriptStore,
}: IRootStore) => ({
  annotateAlterations: flow(alterationStore.annotateAlterations),
  geneEntities: geneStore.entities,
  consequences: consequenceStore.entities,
  getConsequences: consequenceStore.getEntities,
  firebaseDb: firebaseAppStore.firebaseDb,
  vusList: firebaseVusStore.data,
  mutationList: firebaseMutationListStore.data,
  getFlagsByType: flagStore.getFlagsByType,
  alterationCategoryFlagEntities: flagStore.alterationCategoryFlags,
  createFlagEntity: flagStore.createEntity,
  setVusList: addMutationModalStore.setVusList,
  setMutationToEdit: addMutationModalStore.setMutationToEdit,
  alterationStates: addMutationModalStore.alterationStates,
  mutationToEdit: addMutationModalStore.mutationToEdit,
  setShowModifyExonForm: addMutationModalStore.setShowModifyExonForm,
  showModifyExonForm: addMutationModalStore.showModifyExonForm,
  isFetchingAlteration: addMutationModalStore.isFetchingAlteration,
  isFetchingExcludingAlteration: addMutationModalStore.isFetchingExcludingAlteration,
  currentMutationNames: addMutationModalStore.currentMutationNames,
  cleanup: addMutationModalStore.cleanup,
  filterAlterationsAndNotify: addMutationModalStore.filterAlterationsAndNotify,
  fetchAlterations: addMutationModalStore.fetchAlterations,
  setAlterationStates: addMutationModalStore.setAlterationStates,
  selectedAlterationCategoryFlags: addMutationModalStore.selectedAlterationCategoryFlags,
  alterationCategoryComment: addMutationModalStore.alterationCategoryComment,
  setGeneEntity: addMutationModalStore.setGeneEntity,
  updateAlterationStateAfterAlterationAdded: addMutationModalStore.updateAlterationStateAfterAlterationAdded,
  selectedAlterationStateIndex: addMutationModalStore.selectedAlterationStateIndex,
  hasUncommitedExonFormChanges: addMutationModalStore.hasUncommitedExonFormChanges,
  unCommittedExonFormChangesWarning: addMutationModalStore.unCommittedExonFormChangesWarning,
  setProteinExons: addMutationModalStore.setProteinExons,
  proteinExons: addMutationModalStore.proteinExons,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AddMutationModal);

const AddMutationInputOverlay = () => {
  return (
    <div>
      <div>
        Enter alteration(s) in input area, then press <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Enter key</span> or click on{' '}
        <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Add button</span> to annotate alteration(s).
      </div>
      <div className="mt-2">
        <div>String Mutation:</div>
        <div>
          <ul style={{ marginBottom: 0 }}>
            <li>
              Variant alleles seperated by slash - <span className="text-success">R132C/H/G/S/L</span>
            </li>
            <li>
              Comma seperated list of alterations - <span className="text-success">V600E, V600K</span>
            </li>
          </ul>
        </div>
        <div className="mt-2">
          For detailed list, refer to:{' '}
          <SopPageLink>OncoKB SOP - Chapter 6: Table 3.1: OncoKB alteration nomenclature, style and formatting</SopPageLink>
        </div>
      </div>
    </div>
  );
};
