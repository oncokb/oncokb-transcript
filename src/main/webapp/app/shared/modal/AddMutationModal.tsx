import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { flow } from 'mobx';
import React, { KeyboardEventHandler, useEffect, useState } from 'react';
import { Button, Col, Input, InputGroup, InputGroupText, Row } from 'reactstrap';
import { Mutation, AlterationCategories } from '../model/firebase/firebase.model';
import { AlterationAnnotationStatus, AlterationTypeEnum, Gene } from '../api/generated/curation';
import { getDuplicateMutations, getFirebaseVusPath } from '../util/firebase/firebase-utils';
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
import { FlagTypeEnum } from '../model/enumerations/flag-type.enum.model';
import AddExonForm, { ExonCreateInfo } from './MutationModal/AddExonForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AsyncSaveButton } from '../button/AsyncSaveButton';
import MutationDetails from './MutationModal/MutationDetails';
import ExcludedAlterationContent from './MutationModal/ExcludedAlterationContent';
import { EXON_ALTERATION_REGEX } from 'app/config/constants/regex';
import MutationListSection from './MutationModal/MutationListSection';
import classNames from 'classnames';
import { ReferenceGenome } from '../model/enumerations/reference-genome.model';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import DefaultTooltip from '../tooltip/DefaultTooltip';
import { ADD_MUTATION_MODAL_ADD_EXON_BUTTON_ID, ADD_MUTATION_MODAL_INPUT_ID } from 'app/config/constants/html-id';

function getModalErrorMessage(mutationAlreadyExists: MutationExistsMeta) {
  let modalErrorMessage: string | undefined = undefined;
  if (mutationAlreadyExists.exists) {
    modalErrorMessage = 'Mutation already exists in';
    if (mutationAlreadyExists.inMutationList && mutationAlreadyExists.inVusList) {
      modalErrorMessage = 'Mutation already in mutation list and VUS list';
    } else if (mutationAlreadyExists.inMutationList) {
      modalErrorMessage = 'Mutation already in mutation list';
    } else {
      modalErrorMessage = 'Mutation already in VUS list';
    }
  }
  return modalErrorMessage;
}

export type AlterationData = {
  type: AlterationTypeEnum;
  alteration: string;
  name: string;
  consequence: string;
  comment: string;
  excluding: AlterationData[];
  genes?: Gene[];
  proteinChange?: string;
  proteinStart?: number;
  proteinEnd?: number;
  refResidues?: string;
  varResidues?: string;
  warning?: string;
  error?: string;
  alterationFieldValueWhileFetching?: string;
};

interface IAddMutationModalProps extends StoreProps {
  hugoSymbol: string | undefined;
  isGermline: boolean;
  onConfirm: (mutation: Mutation, mutationFirebaseIndex: number) => Promise<void>;
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
  showModifyExonForm,
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
  getProteinExons,
  setProteinExons,
  proteinExons,
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
    if (hugoSymbol) {
      getProteinExons?.(hugoSymbol, ReferenceGenome.GRCh37).then(value => setProteinExons?.(value));
    }
  }, [hugoSymbol]);

  useEffect(() => {
    const dupMutations = getDuplicateMutations(currentMutationNames ?? [], mutationList ?? [], vusList ?? {}, {
      useFullAlterationName: true,
      excludedMutationUuid: mutationToEdit?.name_uuid,
      excludedVusName: convertOptions?.isConverting ? convertOptions.alteration : '',
      exact: true,
    });
    setMutationAlreadyExists({
      exists: dupMutations.length > 0,
      inMutationList: dupMutations.some(mutation => mutation.inMutationList),
      inVusList: dupMutations.some(mutation => mutation.inVusList),
    });
  }, [alterationStates, mutationList, vusList]);

  useEffect(() => {
    async function setExistingAlterations() {
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
    if (EXON_ALTERATION_REGEX.test(alterationString) && proteinExons?.length === 0) {
      notifyError(
        new Error('Removed exons alterations because gene does not have an associated oncokb canonical transcript. Reach out to dev team.'),
      );
    } else {
      try {
        setIsAddAlterationPending(true);
        await updateAlterationStateAfterAlterationAdded?.(parseAlterationName(alterationString, true));
      } finally {
        setIsAddAlterationPending(false);
      }
    }
    setInputValue('');
  }

  async function handleConfirm() {
    const newMutation = mutationToEdit ? _.cloneDeep(mutationToEdit) : new Mutation('');
    const newAlterations = alterationStates?.map(state => convertAlterationDataToAlteration(state)) ?? [];
    newMutation.name = newAlterations.map(alteration => alteration.name).join(', ');
    newMutation.alterations = newAlterations;

    const newAlterationCategories = await handleAlterationCategoriesConfirm();
    newMutation.alteration_categories = newAlterationCategories;

    setErrorMessagesEnabled(false);
    setIsConfirmPending(true);
    try {
      await onConfirm(newMutation, mutationList?.length || 0);
    } finally {
      setErrorMessagesEnabled(true);
      setIsConfirmPending(false);
      cleanup?.();
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

  const handleCancel = () => {
    cleanup?.();
    onCancel();
  };

  const renderInputSection = () => (
    <Row className="mb-2 d-flex align-items-center justify-content-between">
      <Col className="col-8">
        <InputGroup>
          <Input
            id={ADD_MUTATION_MODAL_INPUT_ID}
            placeholder="Enter alteration(s)"
            onKeyDown={handleKeyDown}
            style={{ borderRight: '0' }}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onClick={() => setShowModifyExonForm?.(false)}
          />
          <InputGroupText style={{ backgroundColor: 'transparent', borderLeft: '0' }}>
            <InfoIcon overlay={<AddMutationInputOverlay />} />
          </InputGroupText>
          <AsyncSaveButton
            isSavePending={isAddAlterationPending}
            onClick={handleAlterationAdded}
            confirmText="Add"
            disabled={isAddAlterationPending || !inputValue}
          />
        </InputGroup>
      </Col>
      <Col className="col-1">
        <span className="fw-bold">OR</span>
      </Col>
      <Col className="col-auto d-flex">
        <DefaultTooltip
          overlay={
            'Gene does not have an associated oncokb canonical transcript, which is required for exon curation. Reach out to dev team.'
          }
        >
          <span>
            <Button
              id={ADD_MUTATION_MODAL_ADD_EXON_BUTTON_ID}
              color="primary"
              outline
              className="ms-2"
              onClick={() => setShowModifyExonForm?.(true)}
              disabled={proteinExons?.length === 0}
            >
              <FontAwesomeIcon icon={faPlus} className="me-1" />
              Exon
            </Button>
          </span>
        </DefaultTooltip>
      </Col>
    </Row>
  );

  // Helper function to render exon or mutation list section
  const renderExonOrMutationListSection = () => {
    if (showModifyExonForm) {
      return (
        <>
          <div className="border-top my-4"></div>
          <AddExonForm hugoSymbol={hugoSymbol ?? ''} />
        </>
      );
    }
    if (alterationStates?.length !== 0) {
      return (
        <>
          <div className={classNames(!convertOptions?.isConverting && 'border-top my-4')}></div>
          <Row className="mb-2">
            <Col>
              <MutationListSection />
            </Col>
          </Row>
        </>
      );
    }
    return null;
  };

  // Helper function to render selected alteration state content
  const renderMutationDetailSection = () => {
    if (
      alterationStates !== undefined &&
      selectedAlterationStateIndex !== undefined &&
      selectedAlterationStateIndex > -1 &&
      !_.isNil(alterationStates[selectedAlterationStateIndex])
    ) {
      const selectedAlteration = alterationStates[selectedAlterationStateIndex].alteration;
      return (
        <>
          <div className="border-top my-4"></div>
          {EXON_ALTERATION_REGEX.test(selectedAlteration) ? (
            <AddExonForm hugoSymbol={hugoSymbol ?? ''} defaultExonAlterationName={selectedAlteration} />
          ) : (
            <>
              <MutationDetails alterationData={alterationStates[selectedAlterationStateIndex]} />
              <ExcludedAlterationContent />
            </>
          )}
        </>
      );
    }
    return null;
  };

  const mutationModalBody = (
    <div>
      {!convertOptions?.isConverting && renderInputSection()}
      {renderExonOrMutationListSection()}
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
      modalBody={mutationModalBody}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
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
  getProteinExons: flow(transcriptStore.getProteinExons),
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
              Variant alleles seperated by slash - <span className="text-primary">R132C/H/G/S/L</span>
            </li>
            <li>
              Comma seperated list of alterations - <span className="text-primary">V600E, V600K</span>
            </li>
          </ul>
        </div>
        <div>Exon:</div>
        <ul style={{ marginBottom: 0 }}>
          <li>
            Supported consequences are Insertion, Deletion and Duplication - <span className="text-primary">Exon 4 Deletion</span>
          </li>
          <li>
            Exon range - <span className="text-primary">Exon 4-8 Deletion</span>
          </li>
        </ul>
        <ExonCreateInfo listView />
      </div>
    </div>
  );
};
