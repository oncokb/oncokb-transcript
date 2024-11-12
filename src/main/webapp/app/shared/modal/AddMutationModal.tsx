import Tabs from 'app/components/tabs/tabs';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { flow, flowResult } from 'mobx';
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import ReactSelect, { GroupBase, MenuPlacement } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Alert, Button, Col, Input, Row, Spinner } from 'reactstrap';
import { Alteration, Mutation, VusObjList } from '../model/firebase/firebase.model';
import {
  AlterationAnnotationStatus,
  AlterationTypeEnum,
  AnnotateAlterationBody,
  Gene,
  Alteration as ApiAlteration,
} from '../api/generated/curation';
import { IGene } from '../model/gene.model';
import { getDuplicateMutations, getFirebaseVusPath } from '../util/firebase/firebase-utils';
import { componentInject } from '../util/typed-inject';
import { hasValue, isEqualIgnoreCase, parseAlterationName } from '../util/utils';
import { DefaultAddMutationModal } from './DefaultAddMutationModal';
import './add-mutation-modal.scss';
import classNames from 'classnames';
import { READABLE_ALTERATION, REFERENCE_GENOME } from 'app/config/constants/constants';
import { Unsubscribe } from 'firebase/database';
import Select from 'react-select/dist/declarations/src/Select';
import InfoIcon from '../icons/InfoIcon';
import { Linkout } from '../links/Linkout';
import { SopPageLink } from '../links/SopPageLink';
import { AddMutationModalFieldTestIdType, getAddMuationModalFieldDataTestId } from '../util/test-id-utils';

type AlterationData = {
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

function AddMutationModal({
  hugoSymbol,
  isGermline,
  mutationToEditPath,
  mutationList,
  annotateAlterations,
  geneEntities,
  consequences,
  getConsequences,
  onConfirm,
  onCancel,
  firebaseDb,
  convertOptions,
}: IAddMutationModalProps) {
  const typeOptions: DropdownOption[] = [
    AlterationTypeEnum.ProteinChange,
    AlterationTypeEnum.CopyNumberAlteration,
    AlterationTypeEnum.StructuralVariant,
    AlterationTypeEnum.CdnaChange,
    AlterationTypeEnum.GenomicChange,
    AlterationTypeEnum.Any,
  ].map(type => ({ label: READABLE_ALTERATION[type], value: type }));
  const consequenceOptions: DropdownOption[] =
    consequences?.map((consequence): DropdownOption => ({ label: consequence.name, value: consequence.id })) ?? [];

  const [inputValue, setInputValue] = useState('');
  const [tabStates, setTabStates] = useState<AlterationData[]>([]);
  const [excludingInputValue, setExcludingInputValue] = useState('');
  const [excludingCollapsed, setExcludingCollapsed] = useState(true);
  const [mutationAlreadyExists, setMutationAlreadyExists] = useState({ exists: false, inMutationList: false, inVusList: false });
  const [mutationToEdit, setMutationToEdit] = useState<Mutation | null>(null);
  const [errorMessagesEnabled, setErrorMessagesEnabled] = useState(true);
  const [isFetchingAlteration, setIsFetchingAlteration] = useState(false);
  const [isFetchingExcludingAlteration, setIsFetchingExcludingAlteration] = useState(false);
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  const [vusList, setVusList] = useState<VusObjList | null>(null);

  const inputRef = useRef<Select<AlterationData, true, GroupBase<AlterationData>> | null>(null);

  const geneEntity: IGene | undefined = useMemo(() => {
    return geneEntities?.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [geneEntities]);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, getFirebaseVusPath(isGermline, hugoSymbol)), snapshot => {
        setVusList(snapshot.val());
      }),
    );

    if (mutationToEditPath) {
      callbacks.push(
        onValue(ref(firebaseDb, mutationToEditPath), snapshot => {
          setMutationToEdit(snapshot.val());
        }),
      );
    }

    return () => callbacks.forEach(callback => callback?.());
  }, []);

  useEffect(() => {
    if (convertOptions?.isConverting) {
      handleAlterationAdded();
    }
  }, [convertOptions?.isConverting]);

  useEffect(() => {
    const dupMutations = getDuplicateMutations(currentMutationNames, mutationList ?? [], vusList ?? {}, {
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
  }, [tabStates, mutationList, vusList]);

  useEffect(() => {
    function convertAlterationToAlterationData(alteration: Alteration): AlterationData {
      const { name: variantName } = parseAlterationName(alteration.name)[0];

      return {
        type: alteration.type,
        alteration: alteration.alteration,
        name: variantName || alteration.alteration,
        consequence: alteration.consequence,
        comment: alteration.comment,
        excluding: alteration.excluding?.map(ex => convertAlterationToAlterationData(ex)) || [],
        genes: alteration?.genes || [],
        proteinChange: alteration?.proteinChange,
        proteinStart: alteration?.proteinStart === -1 ? undefined : alteration?.proteinStart,
        proteinEnd: alteration?.proteinEnd === -1 ? undefined : alteration?.proteinEnd,
        refResidues: alteration?.refResidues,
        varResidues: alteration?.varResidues,
      };
    }

    async function setExistingAlterations() {
      if (mutationToEdit?.alterations?.length !== undefined && mutationToEdit.alterations.length > 0) {
        setTabStates(mutationToEdit?.alterations?.map(alt => convertAlterationToAlterationData(alt)) ?? []);
        return;
      }

      const parsedAlterations = mutationToEdit?.name?.split(',').map(name => parseAlterationName(name.trim())[0]); // at this point can be sure each alteration name does not have / character

      const entityStatusAlterationsPromise = fetchAlterations(parsedAlterations?.map(alt => alt.alteration) ?? []);
      const excludingEntityStatusAlterationsPromises: Promise<AlterationAnnotationStatus[]>[] = [];
      for (const alt of parsedAlterations ?? []) {
        excludingEntityStatusAlterationsPromises.push(fetchAlterations(alt.excluding));
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
            excluding.push(
              convertEntityStatusAlterationToAlterationData(
                entityStatusExcludingAlterations[i][exIndex],
                parsedAlterations[i].excluding[exIndex],
                [],
                '',
              ),
            );
          }
          excludingAlterations.push(excluding);
        }
      }

      if (parsedAlterations) {
        const alterations = entityStatusAlterations.map((alt, index) =>
          convertEntityStatusAlterationToAlterationData(
            alt,
            parsedAlterations[index].alteration,
            excludingAlterations[index] || [],
            parsedAlterations[index].comment,
            parsedAlterations[index].name,
          ),
        );

        setTabStates(alterations);
      }
    }

    if (mutationToEdit) {
      setExistingAlterations();
    }
  }, [mutationToEdit]);

  useEffect(() => {
    getConsequences?.({});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const currentMutationNames = useMemo(() => {
    return tabStates.map(state => getFullAlterationName({ ...state, comment: '' }).toLowerCase()).sort();
  }, [tabStates]);

  function filterAlterationsAndNotify(
    alterations: ReturnType<typeof parseAlterationName>,
    alterationData: AlterationData[],
    alterationIndex?: number,
  ) {
    // remove alterations that already exist in modal
    const newAlterations = alterations.filter(alt => {
      return !alterationData.some((state, index) => {
        if (index === alterationIndex) {
          return false;
        }

        const stateName = state.alteration.toLowerCase();
        const stateExcluding = state.excluding.map(ex => ex.alteration.toLowerCase()).sort();
        const altName = alt.alteration.toLowerCase();
        const altExcluding = alt.excluding.map(ex => ex.toLowerCase()).sort();
        return stateName === altName && _.isEqual(stateExcluding, altExcluding);
      });
    });

    if (alterations.length !== newAlterations.length) {
      notifyError(new Error('Duplicate alteration(s) removed'));
    }

    return newAlterations;
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

  function convertEntityStatusAlterationToAlterationData(
    entityStatusAlteration: AlterationAnnotationStatus,
    alterationName: string,
    excluding: AlterationData[],
    comment: string,
    variantName?: string,
  ): AlterationData {
    const alteration = entityStatusAlteration.entity;
    const alterationData: AlterationData = {
      type: alteration?.type ?? AlterationTypeEnum.Unknown,
      alteration: alterationName,
      name: (variantName || alteration?.name) ?? '',
      consequence: alteration?.consequence?.name ?? '',
      comment,
      excluding,
      genes: alteration?.genes,
      proteinChange: alteration?.proteinChange,
      proteinStart: alteration?.start,
      proteinEnd: alteration?.end,
      refResidues: alteration?.refResidues,
      varResidues: alteration?.variantResidues,
      warning: entityStatusAlteration.warning ? entityStatusAlteration.message : undefined,
      error: entityStatusAlteration.error ? entityStatusAlteration.message : undefined,
    };

    // if the backend's response is different from the frontend response, set them equal to each other.
    if (alteration?.alteration !== alterationName) {
      alterationData.alteration = alteration?.alteration ?? '';
    }

    return alterationData;
  }

  async function fetchNormalAlteration(newAlteration: string, alterationIndex: number, alterationData: AlterationData[]) {
    const newParsedAlteration = filterAlterationsAndNotify(parseAlterationName(newAlteration), alterationData, alterationIndex);
    if (newParsedAlteration.length === 0) {
      setTabStates(states => {
        const newStates = _.cloneDeep(states);
        newStates[alterationIndex].alterationFieldValueWhileFetching = undefined;
        return newStates;
      });
    }

    const newComment = newParsedAlteration[0].comment;
    const newVariantName = newParsedAlteration[0].name;

    let newExcluding: AlterationData[];
    if (
      _.isEqual(
        newParsedAlteration[0].excluding,
        alterationData[alterationIndex]?.excluding.map(ex => ex.alteration),
      )
    ) {
      newExcluding = alterationData[alterationIndex].excluding;
    } else {
      const excludingEntityStatusAlterations = await fetchAlterations(newParsedAlteration[0].excluding);
      newExcluding =
        excludingEntityStatusAlterations?.map((ex, index) =>
          convertEntityStatusAlterationToAlterationData(ex, newParsedAlteration[0].excluding[index], [], ''),
        ) ?? [];
    }

    const alterationPromises: Promise<AlterationAnnotationStatus | undefined>[] = [];
    let newAlterations: AlterationData[] = [];
    if (newParsedAlteration[0].alteration !== alterationData[alterationIndex]?.alteration) {
      alterationPromises.push(fetchAlteration(newParsedAlteration[0].alteration));
    } else {
      alterationData[alterationIndex].excluding = newExcluding;
      alterationData[alterationIndex].comment = newComment;
      alterationData[alterationIndex].name = newVariantName || newParsedAlteration[0].alteration;
      newAlterations.push(alterationData[alterationIndex]);
    }

    for (let i = 1; i < newParsedAlteration.length; i++) {
      alterationPromises.push(fetchAlteration(newParsedAlteration[i].alteration));
    }

    newAlterations = [
      ...newAlterations,
      ...(await Promise.all(alterationPromises))
        .filter(hasValue)
        .map((alt, index) =>
          convertEntityStatusAlterationToAlterationData(
            alt,
            newParsedAlteration[index + newAlterations.length].alteration,
            newExcluding,
            newComment,
            newVariantName,
          ),
        ),
    ];
    newAlterations[0].alterationFieldValueWhileFetching = undefined;

    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates.splice(alterationIndex, 1, ...newAlterations);
      return newStates;
    });
  }

  const fetchNormalAlterationDebounced = useCallback(
    _.debounce(async (newAlteration: string, alterationIndex: number, alterationData: AlterationData[]) => {
      await fetchNormalAlteration(newAlteration, alterationIndex, alterationData);
      setIsFetchingAlteration(false);
    }, 1000),
    [tabStates.length],
  );

  function handleNormalAlterationChange(newValue: string, alterationIndex: number) {
    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex].alterationFieldValueWhileFetching = newValue;
      return newStates;
    });
    fetchNormalAlterationDebounced(newValue, alterationIndex, tabStates);
  }

  async function fetchExcludedAlteration(
    newAlteration: string,
    alterationIndex: number,
    excludingIndex: number,
    alterationData: AlterationData[],
  ) {
    const newParsedAlteration = parseAlterationName(newAlteration);

    const currentState = alterationData[alterationIndex];
    const alteration = currentState.alteration.toLowerCase();
    let excluding: string[] = [];
    for (let i = 0; i < currentState.excluding.length; i++) {
      if (i === excludingIndex) {
        excluding.push(...newParsedAlteration.map(alt => alt.alteration.toLowerCase()));
      } else {
        excluding.push(currentState.excluding[excludingIndex].alteration.toLowerCase());
      }
    }
    excluding = excluding.sort();
    if (
      alterationData.some(
        state =>
          state.alteration.toLowerCase() === alteration &&
          _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding),
      )
    ) {
      notifyError(new Error('Duplicate alteration(s) removed'));
      setTabStates(states => {
        const newStates = _.cloneDeep(states);
        newStates[alterationIndex].excluding.splice(excludingIndex, 1);
        return newStates;
      });
      return;
    }

    const alterationPromises: Promise<AlterationAnnotationStatus | undefined>[] = [];
    let newAlterations: AlterationData[] = [];
    if (newParsedAlteration[0].alteration !== alterationData[alterationIndex]?.excluding[excludingIndex].alteration) {
      alterationPromises.push(fetchAlteration(newParsedAlteration[0].alteration));
    } else {
      newAlterations.push(alterationData[alterationIndex].excluding[excludingIndex]);
    }

    for (let i = 1; i < newParsedAlteration.length; i++) {
      alterationPromises.push(fetchAlteration(newParsedAlteration[i].alteration));
    }
    newAlterations = [
      ...newAlterations,
      ...(await Promise.all(alterationPromises))
        .map((alt, index) =>
          alt
            ? convertEntityStatusAlterationToAlterationData(
                alt,
                newParsedAlteration[index].alteration,
                [],
                newParsedAlteration[index].comment,
              )
            : undefined,
        )
        .filter(hasValue),
    ];

    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex].excluding.splice(excludingIndex, 1, ...newAlterations);
      return newStates;
    });
  }

  const fetchExcludedAlterationDebounced = useCallback(
    _.debounce(async (newAlteration: string, alterationIndex: number, excludingIndex: number, alterationData: AlterationData[]) => {
      await fetchExcludedAlteration(newAlteration, alterationIndex, excludingIndex, alterationData);
      setIsFetchingExcludingAlteration(false);
    }, 1000),
    [],
  );

  async function handleAlterationChange(newValue: string, alterationIndex: number, excludingIndex?: number, isDebounced = true) {
    if (!_.isNil(excludingIndex)) {
      setIsFetchingExcludingAlteration(true);

      if (isDebounced) {
        handleExcludingFieldChange(newValue, 'alteration', alterationIndex, excludingIndex);
        fetchExcludedAlterationDebounced(newValue, alterationIndex, excludingIndex, tabStates);
      } else {
        await fetchExcludedAlteration(newValue, alterationIndex, excludingIndex, tabStates);
        setIsFetchingExcludingAlteration(false);
      }
    } else {
      setIsFetchingAlteration(true);

      if (isDebounced) {
        handleNormalAlterationChange(newValue, alterationIndex);
      } else {
        await fetchNormalAlteration(newValue, alterationIndex, tabStates);
        setIsFetchingAlteration(false);
      }
    }
  }

  function handleNormalFieldChange(newValue: string, field: keyof AlterationData, alterationIndex: number) {
    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex][field as string] = newValue;
      return newStates;
    });
  }

  function handleExcludingFieldChange(newValue: string, field: keyof AlterationData, alterationIndex: number, excludingIndex: number) {
    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex].excluding[excludingIndex][field as string] = newValue;
      return newStates;
    });
  }

  function handleFieldChange(newValue: string, field: keyof AlterationData, alterationIndex: number, excludingIndex?: number) {
    !_.isNil(excludingIndex)
      ? handleExcludingFieldChange(newValue, field, alterationIndex, excludingIndex)
      : handleNormalFieldChange(newValue, field, alterationIndex);
  }

  async function handleAlterationAdded() {
    let alterationString = inputValue;
    if (convertOptions?.isConverting) {
      alterationString = convertOptions.alteration;
    }
    const newParsedAlteration = filterAlterationsAndNotify(parseAlterationName(alterationString), tabStates);

    if (newParsedAlteration.length === 0) {
      return;
    }

    const newEntityStatusAlterationsPromise = fetchAlterations(newParsedAlteration.map(alt => alt.alteration));
    const newEntityStatusExcludingAlterationsPromise = fetchAlterations(newParsedAlteration[0].excluding);
    const [newEntityStatusAlterations, newEntityStatusExcludingAlterations] = await Promise.all([
      newEntityStatusAlterationsPromise,
      newEntityStatusExcludingAlterationsPromise,
    ]);

    const newExcludingAlterations = newEntityStatusExcludingAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[0].excluding[index], [], ''),
    );
    const newAlterations = newEntityStatusAlterations.map((alt, index) =>
      convertEntityStatusAlterationToAlterationData(
        alt,
        newParsedAlteration[index].alteration,
        _.cloneDeep(newExcludingAlterations),
        newParsedAlteration[index].comment,
        newParsedAlteration[index].name,
      ),
    );

    setTabStates(states => [...states, ...newAlterations]);
    setInputValue('');
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

  function getFullAlterationName(alterationData: AlterationData, includeVariantName = true) {
    const variantName = includeVariantName && alterationData.name !== alterationData.alteration ? ` [${alterationData.name}]` : '';
    const excluding =
      alterationData.excluding.length > 0 ? ` {excluding ${alterationData.excluding.map(ex => ex.alteration).join(' ; ')}}` : '';
    const comment = alterationData.comment ? ` (${alterationData.comment})` : '';
    return `${alterationData.alteration}${variantName}${excluding}${comment}`;
  }

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
    const excludingSection = !_.isNil(excludingIndex) ? <></> : getExcludingSection(alterationData, alterationIndex);

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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.ALTERATION, alterationIndex, excludingIndex)}
        />
        {content}
        <AddMutationModalField
          label="Comment"
          value={alterationData.comment}
          placeholder="Input comment"
          onChange={newValue => handleFieldChange(newValue, 'comment', alterationIndex, excludingIndex)}
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.COMMENT, alterationIndex, excludingIndex)}
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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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

  function getCopyNumberAlterationContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    return (
      <div>
        <AddMutationModalField
          label="Name"
          value={alterationData.name}
          placeholder="Input name"
          onChange={newValue => handleFieldChange(newValue, 'name', alterationIndex, excludingIndex)}
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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
          dataTestId={getAddMuationModalFieldDataTestId(AddMutationModalFieldTestIdType.NAME, alterationIndex, excludingIndex)}
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
                  dataTestIdPrefix="excluding"
                />
              </div>
            </Col>
          </Row>
        )}
      </>
    );
  }

  function getErrorSection(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    const suggestion = new RegExp('The alteration name is invalid, do you mean (.+)\\?').exec(alterationData.error ?? '')?.[1];

    return (
      <div>
        <Alert color="danger" className="alteration-message" fade={false}>
          {alterationData.error}
        </Alert>
        {suggestion && (
          <div className="d-flex justify-content-end" style={{ marginTop: '-10px' }}>
            <Button
              className="me-1"
              color="danger"
              outline
              size="sm"
              onClick={() => {
                setTabStates(states => {
                  const newStates = _.cloneDeep(states);
                  if (!_.isNil(excludingIndex)) {
                    newStates[alterationIndex].excluding.splice(excludingIndex, 1);
                  } else {
                    newStates.splice(alterationIndex, 1);
                  }
                  return newStates;
                });

                inputRef.current?.focus();
              }}
            >
              No
            </Button>
            <Button
              onClick={() => {
                const newAlterationData = _.cloneDeep(alterationData);
                newAlterationData.alteration = suggestion;
                handleAlterationChange(getFullAlterationName(newAlterationData, false), alterationIndex, excludingIndex, false);
              }}
              color="success"
              outline
              size="sm"
            >
              Yes
            </Button>
          </div>
        )}
      </div>
    );
  }

  const modalBody = (
    <>
      <Row className="align-items-center mb-3">
        <Col className={classNames(!convertOptions?.isConverting && 'pe-0')}>
          <CreatableSelect
            inputId="add-mutation-modal-input"
            ref={inputRef}
            components={{
              DropdownIndicator: null,
            }}
            isMulti
            isDisabled={convertOptions?.isConverting}
            menuIsOpen={false}
            placeholder="Enter alteration(s)"
            inputValue={inputValue}
            onInputChange={(newInput, { action }) => {
              if (action !== 'menu-close' && action !== 'input-blur') {
                setInputValue(newInput);
              }
            }}
            value={tabStates.map(state => {
              const fullAlterationName = getFullAlterationName(state);
              return { label: fullAlterationName, value: fullAlterationName, ...state };
            })}
            onChange={(newAlterations: readonly AlterationData[]) =>
              setTabStates(states =>
                states.filter(state => newAlterations.some(alt => getFullAlterationName(alt) === getFullAlterationName(state))),
              )
            }
            onKeyDown={handleKeyDown}
          />
        </Col>
        {!convertOptions?.isConverting ? (
          <>
            <Col className="col-auto ps-2">
              <div>
                <Button color="primary" disabled={!inputValue} onClick={handleAlterationAdded}>
                  Add
                </Button>
                <InfoIcon className="ms-2" overlay={<AddMutationInputOverlay />}></InfoIcon>
              </div>
            </Col>
          </>
        ) : undefined}
      </Row>
      {tabStates.length > 0 && (
        <div className="pe-3" data-testid={'add-mutation-modal-tabs'}>
          <Tabs
            tabs={tabStates.map((alterationData, index) => {
              return {
                title: getTabTitle(alterationData),
                content: getTabContent(alterationData, index),
              };
            })}
          />
        </div>
      )}
    </>
  );

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

  let modalWarningMessage: string | undefined = undefined;
  if (convertOptions?.isConverting && !isEqualIgnoreCase(convertOptions.alteration, currentMutationNames.join(', '))) {
    modalWarningMessage = 'Name differs from original VUS name';
  }

  return (
    <DefaultAddMutationModal
      isUpdate={!!mutationToEdit}
      modalHeader={convertOptions?.isConverting ? <div>Promoting Variant(s) to Mutation</div> : undefined}
      modalBody={modalBody}
      onCancel={onCancel}
      onConfirm={async () => {
        function convertAlterationDataToAlteration(alterationData: AlterationData) {
          const alteration = new Alteration();
          alteration.type = alterationData.type;
          alteration.alteration = alterationData.alteration;
          alteration.name = getFullAlterationName(alterationData);
          alteration.proteinChange = alterationData.proteinChange || '';
          alteration.proteinStart = alterationData.proteinStart || -1;
          alteration.proteinEnd = alterationData.proteinEnd || -1;
          alteration.refResidues = alterationData.refResidues || '';
          alteration.varResidues = alterationData.varResidues || '';
          alteration.consequence = alterationData.consequence;
          alteration.comment = alterationData.comment;
          alteration.excluding = alterationData.excluding.map(ex => convertAlterationDataToAlteration(ex));
          alteration.genes = alterationData.genes || [];
          return alteration;
        }

        const newMutation = mutationToEdit ? _.cloneDeep(mutationToEdit) : new Mutation('');
        const newAlterations = tabStates.map(state => convertAlterationDataToAlteration(state));
        newMutation.name = newAlterations.map(alteration => alteration.name).join(', ');
        newMutation.alterations = newAlterations;

        setErrorMessagesEnabled(false);
        setIsConfirmPending(true);
        try {
          await onConfirm(newMutation, mutationList?.length || 0);
        } finally {
          setErrorMessagesEnabled(true);
          setIsConfirmPending(false);
        }
      }}
      errorMessages={modalErrorMessage && errorMessagesEnabled ? [modalErrorMessage] : undefined}
      warningMessages={modalWarningMessage ? [modalWarningMessage] : undefined}
      confirmButtonDisabled={
        tabStates.length === 0 ||
        mutationAlreadyExists.exists ||
        isFetchingAlteration ||
        isFetchingExcludingAlteration ||
        tabStates.some(tab => tab.error || tab.excluding.some(ex => ex.error)) ||
        isConfirmPending
      }
      isConfirmPending={isConfirmPending}
    />
  );
}

interface IAddMutationModalFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (newValue: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  dataTestId?: string;
}

function AddMutationModalField({
  label,
  value: value,
  placeholder,
  onChange,
  isLoading,
  disabled,
  dataTestId,
}: IAddMutationModalFieldProps) {
  return (
    <div className="d-flex align-items-center mb-3">
      <Col className="px-0 col-3 me-3 align-items-center">
        <div className="d-flex align-items-center">
          <span className="me-2">{label}</span>
          {isLoading && <Spinner color="primary" size="sm" />}
        </div>
      </Col>
      <Col className="px-0">
        <Input
          data-testid={dataTestId}
          disabled={disabled}
          value={value}
          onChange={event => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
        />
      </Col>
    </div>
  );
}

type DropdownOption = {
  label: string;
  value: any;
};
interface IAddMutationModalDropdownProps {
  label: string;
  value: DropdownOption;
  options: DropdownOption[];
  menuPlacement?: MenuPlacement;
  onChange: (newValue: DropdownOption | null) => void;
}

function AddMutationModalDropdown({ label, value, options, menuPlacement, onChange }: IAddMutationModalDropdownProps) {
  return (
    <div className="d-flex align-items-center mb-3">
      <Col className="px-0 col-3 me-3">
        <span>{label}</span>
      </Col>
      <Col className="px-0">
        <ReactSelect value={value} options={options} onChange={onChange} menuPlacement={menuPlacement} isClearable />
      </Col>
    </div>
  );
}

const AddMutationInputOverlay = () => {
  return (
    <div>
      <div>
        Enter alteration(s) in input area, then press <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Enter key</span> or click on{' '}
        <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>Add button</span> to annotate alteration(s).
      </div>
      <div className="mt-2">
        <div>Supported inputs:</div>
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

const mapStoreToProps = ({
  alterationStore,
  consequenceStore,
  geneStore,
  firebaseAppStore,
  firebaseVusStore,
  firebaseMutationListStore,
}: IRootStore) => ({
  annotateAlterations: flow(alterationStore.annotateAlterations),
  geneEntities: geneStore.entities,
  consequences: consequenceStore.entities,
  getConsequences: consequenceStore.getEntities,
  firebaseDb: firebaseAppStore.firebaseDb,
  vusList: firebaseVusStore.data,
  mutationList: firebaseMutationListStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AddMutationModal);
