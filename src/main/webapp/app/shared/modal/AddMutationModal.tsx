import Tabs from 'app/components/tabs/tabs';
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Input, Modal, ModalBody, ModalFooter, Row } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import _ from 'lodash';
import { notNullOrUndefined, parseAlterationName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { flow, flowResult } from 'mobx';
import { AlterationTypeEnum, EntityStatusAlteration, Gene } from '../api/generated';
import './add-mutation-modal.scss';
import { IGene } from '../model/gene.model';
import { FaChevronDown, FaChevronUp, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Alteration, Mutation } from '../model/firebase/firebase.model';
import ReactSelect, { MenuPlacement } from 'react-select';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import styles from './styles.module.scss';

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
  mutationList: Mutation[];
  hugoSymbol: string;
  isOpen: boolean;
  onConfirm: (alterations: Alteration[]) => void;
  onCancel: () => void;
  mutationToEdit?: Mutation;
}

function AddMutationModal(props: IAddMutationModalProps) {
  const { isOpen, ...rest } = props;

  return isOpen ? <AddMutationModalContent {...rest} /> : <></>;
}

function AddMutationModalContent({
  mutationList,
  hugoSymbol,
  mutationToEdit,
  annotateAlteration,
  geneEntities,
  consequences,
  getConsequences,
  onConfirm,
  onCancel,
}: Omit<IAddMutationModalProps, 'isOpen'>) {
  const typeOptions: DropdownOption[] = [
    AlterationTypeEnum.ProteinChange,
    AlterationTypeEnum.CopyNumberAlteration,
    AlterationTypeEnum.StructuralVariant,
    AlterationTypeEnum.CdnaChange,
    AlterationTypeEnum.Any,
  ].map(type => ({ label: type, value: type }));
  const consequenceOptions: DropdownOption[] = consequences.map(consequence => ({ label: consequence.name, value: consequence.id }));

  const [inputValue, setInputValue] = useState('');
  const [tabStates, setTabStates] = useState<AlterationData[]>([]);
  const [excludingInputValue, setExcludingInputValue] = useState('');
  const [excludingCollapsed, setExcludingCollapsed] = useState(true);
  const [mutationAlreadyExists, setMutationAlreadyExists] = useState(false);

  const inputRef = useRef(null);

  const geneEntity: IGene | undefined = useMemo(() => {
    return geneEntities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [geneEntities]);

  useEffect(() => {
    const mutationNames = mutationList
      .filter(mutation => mutationToEdit?.name_uuid !== mutation.name_uuid)
      .map(mutation =>
        mutation.name
          .split(',')
          .map(alt => {
            const parsedAlteration = parseAlterationName(alt)[0];
            const variantName = parsedAlteration.name ? ` [${parsedAlteration.name}]` : '';
            const excluding = parsedAlteration.excluding.length > 0 ? ` {excluding ${parsedAlteration.excluding.join(' ; ')}}` : '';
            return `${parsedAlteration.alteration}${variantName}${excluding}`.toLowerCase();
          })
          .sort()
      );

    const currentMutationName = tabStates.map(state => getFullAlterationName({ ...state, comment: '' }).toLowerCase()).sort();

    if (mutationNames.some(mutation => _.isEqual(mutation, currentMutationName))) {
      setMutationAlreadyExists(true);
    } else {
      setMutationAlreadyExists(false);
    }
  }, [tabStates, mutationList]);

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
        proteinStart: alteration?.proteinStart === -1 ? null : alteration?.proteinStart,
        proteinEnd: alteration?.proteinEnd === -1 ? null : alteration?.proteinEnd,
        refResidues: alteration?.refResidues,
        varResidues: alteration?.varResidues,
      };
    }

    async function setExistingAlterations() {
      if (mutationToEdit.alterations?.length > 0) {
        setTabStates(mutationToEdit.alterations.map(alt => convertAlterationToAlterationData(alt)));
        return;
      }

      const parsedAlterations = mutationToEdit.name.split(',').map(name => parseAlterationName(name.trim())[0]); // at this point can be sure each alteration name does not have / character

      const entityStatusAlterationsPromise = fetchAlterations(parsedAlterations.map(alt => alt.alteration));
      const excludingEntityStatusAlterationsPromises: Promise<EntityStatusAlteration[]>[] = [];
      for (const alt of parsedAlterations) {
        excludingEntityStatusAlterationsPromises.push(fetchAlterations(alt.excluding));
      }
      const [entityStatusAlterations, entityStatusExcludingAlterations] = await Promise.all([
        entityStatusAlterationsPromise,
        Promise.all(excludingEntityStatusAlterationsPromises),
      ]);

      const excludingAlterations: AlterationData[][] = [];
      for (let i = 0; i < parsedAlterations.length; i++) {
        const excluding: AlterationData[] = [];
        for (let exIndex = 0; exIndex < parsedAlterations[i].excluding.length; exIndex++) {
          excluding.push(
            convertEntityStatusAlterationToAlterationData(
              entityStatusExcludingAlterations[i][exIndex],
              parsedAlterations[i].excluding[exIndex],
              [],
              ''
            )
          );
        }
        excludingAlterations.push(excluding);
      }

      const alterations = entityStatusAlterations.map((alt, index) =>
        convertEntityStatusAlterationToAlterationData(
          alt,
          parsedAlterations[index].alteration,
          excludingAlterations[index] || [],
          parsedAlterations[index].comment,
          parsedAlterations[index].name
        )
      );

      setTabStates(alterations);
    }

    if (mutationToEdit) {
      setExistingAlterations();
    }
  }, [mutationToEdit]);

  useEffect(() => {
    getConsequences({});
  }, []);

  function filterAlterationsAndNotify(
    alterations: ReturnType<typeof parseAlterationName>,
    alterationData: AlterationData[],
    alterationIndex?: number
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

  async function fetchAlteration(alterationName: string) {
    try {
      return await flowResult(annotateAlteration({ alteration: alterationName, geneIds: [geneEntity.id] }, false));
    } catch (error) {
      notifyError(error);
    }
  }

  async function fetchAlterations(alterationNames: string[]) {
    try {
      const alterationPromises = alterationNames.map(name => fetchAlteration(name));
      return await Promise.all(alterationPromises);
    } catch (error) {
      notifyError(error);
    }
  }

  function convertEntityStatusAlterationToAlterationData(
    entityStatusAlteration: EntityStatusAlteration,
    alterationName: string,
    excluding: AlterationData[],
    comment: string,
    variantName?: string
  ): AlterationData {
    const alteration = entityStatusAlteration.entity;
    return {
      type: alteration?.type,
      alteration: alterationName,
      name: variantName || alteration?.name,
      consequence: alteration?.consequence?.name,
      comment,
      excluding,
      genes: alteration?.genes,
      proteinChange: alteration?.proteinChange,
      proteinStart: alteration?.start,
      proteinEnd: alteration?.end,
      refResidues: alteration?.refResidues,
      varResidues: alteration?.variantResidues,
      warning: entityStatusAlteration.warning ? entityStatusAlteration.message : null,
      error: entityStatusAlteration.error ? entityStatusAlteration.message : null,
    };
  }

  async function fetchNormalAlteration(newAlteration: string, alterationIndex: number, alterationData: AlterationData[]) {
    const newParsedAlteration = filterAlterationsAndNotify(parseAlterationName(newAlteration), alterationData, alterationIndex);
    if (newParsedAlteration.length === 0) {
      setTabStates(states => {
        const newStates = _.cloneDeep(states);
        newStates[alterationIndex].alterationFieldValueWhileFetching = null;
        return newStates;
      });
    }

    const newComment = newParsedAlteration[0].comment;
    const newVariantName = newParsedAlteration[0].name;

    let newExcluding: AlterationData[];
    if (
      _.isEqual(
        newParsedAlteration[0].excluding,
        alterationData[alterationIndex]?.excluding.map(ex => ex.alteration)
      )
    ) {
      newExcluding = alterationData[alterationIndex].excluding;
    } else {
      const excludingEntityStatusAlterations = await fetchAlterations(newParsedAlteration[0].excluding);
      newExcluding = excludingEntityStatusAlterations.map((ex, index) =>
        convertEntityStatusAlterationToAlterationData(ex, newParsedAlteration[0].excluding[index], [], '')
      );
    }

    const alterationPromises: Promise<EntityStatusAlteration>[] = [];
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
      ...(await Promise.all(alterationPromises)).map((alt, index) =>
        convertEntityStatusAlterationToAlterationData(
          alt,
          newParsedAlteration[index + newAlterations.length].alteration,
          newExcluding,
          newComment,
          newVariantName
        )
      ),
    ];
    newAlterations[0].alterationFieldValueWhileFetching = null;

    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates.splice(alterationIndex, 1, ...newAlterations);
      return newStates;
    });
  }

  const fetchNormalAlterationDebounced = useCallback(
    _.debounce((newAlteration: string, alterationIndex: number, alterationData: AlterationData[]) => {
      fetchNormalAlteration(newAlteration, alterationIndex, alterationData);
    }, 1000),
    [tabStates.length]
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
    alterationData: AlterationData[]
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
          _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding)
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

    const alterationPromises: Promise<EntityStatusAlteration>[] = [];
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
      ...(await Promise.all(alterationPromises)).map((alt, index) =>
        convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[index].alteration, [], newParsedAlteration[index].comment)
      ),
    ];

    setTabStates(states => {
      const newStates = _.cloneDeep(states);
      newStates[alterationIndex].excluding.splice(excludingIndex, 1, ...newAlterations);
      return newStates;
    });
  }

  const fetchExcludedAlterationDebounced = useCallback(
    _.debounce((newAlteration: string, alterationIndex: number, excludingIndex: number, alterationData: AlterationData[]) => {
      fetchExcludedAlteration(newAlteration, alterationIndex, excludingIndex, alterationData);
    }, 1000),
    []
  );

  function handleAlterationChange(newValue: string, alterationIndex: number, excludingIndex?: number, isDebounced = true) {
    if (notNullOrUndefined(excludingIndex)) {
      if (isDebounced) {
        handleExcludingFieldChange(newValue, 'alteration', alterationIndex, excludingIndex);
        fetchExcludedAlterationDebounced(newValue, alterationIndex, excludingIndex, tabStates);
      } else {
        fetchExcludedAlteration(newValue, alterationIndex, excludingIndex, tabStates);
      }
    } else {
      if (isDebounced) {
        handleNormalAlterationChange(newValue, alterationIndex);
      } else {
        fetchNormalAlteration(newValue, alterationIndex, tabStates);
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
    notNullOrUndefined(excludingIndex)
      ? handleExcludingFieldChange(newValue, field, alterationIndex, excludingIndex)
      : handleNormalFieldChange(newValue, field, alterationIndex);
  }

  const handleKeyDown: KeyboardEventHandler = async event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      const newParsedAlteration = filterAlterationsAndNotify(parseAlterationName(inputValue), tabStates);
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
        convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[0].excluding[index], [], '')
      );
      const newAlterations = newEntityStatusAlterations.map((alt, index) =>
        convertEntityStatusAlterationToAlterationData(
          alt,
          newParsedAlteration[index].alteration,
          _.cloneDeep(newExcludingAlterations),
          newParsedAlteration[index].comment,
          newParsedAlteration[index].name
        )
      );

      setTabStates(states => [...states, ...newAlterations]);

      setInputValue('');
      event.preventDefault();
    }
  };

  const handleKeyDownExcluding = async (event: React.KeyboardEvent<Element>, alterationIndex: number) => {
    if (!excludingInputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
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
            _.isEqual(state.excluding.map(ex => ex.alteration.toLowerCase()).sort(), excluding)
        )
      ) {
        notifyError(new Error('Duplicate alteration(s) removed'));
        return;
      }

      const newComment = newParsedAlteration[0].comment;
      const newVariantName = newParsedAlteration[0].name;

      const newEntityStatusAlterations = await fetchAlterations(newParsedAlteration.map(alt => alt.alteration));

      const newAlterations = newEntityStatusAlterations.map((alt, index) =>
        convertEntityStatusAlterationToAlterationData(alt, newParsedAlteration[index].alteration, [], newComment, newVariantName)
      );

      setTabStates(states => {
        const newStates = _.cloneDeep(states);
        newStates[alterationIndex].excluding.push(...newAlterations);
        return newStates;
      });

      setExcludingInputValue('');
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
          <FaExclamationTriangle className="text-danger mr-1 mb-1" />
          {fullAlterationName}
        </span>
      );
    }

    if (tabAlterationData.warning) {
      return (
        <span>
          <FaExclamationTriangle className="text-warning mr-1 mb-1" />
          {fullAlterationName}
        </span>
      );
    }

    return fullAlterationName;
  }

  function getTabContent(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    const excludingSection = notNullOrUndefined(excludingIndex) ? <></> : getExcludingSection(alterationData, alterationIndex);

    let content: JSX.Element;
    switch (alterationData.type) {
      case AlterationTypeEnum.ProteinChange:
        content = getProteinChangeContent(alterationData, alterationIndex, excludingIndex);
        break;
      case AlterationTypeEnum.CopyNumberAlteration:
        content = getCopyNumberAlterationContent(alterationData, alterationIndex, excludingIndex);
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
          <Row>
            <Col className="px-0">
              <Alert color="warning" className="alteration-message" fade={false}>
                {alterationData.warning}
              </Alert>
            </Col>
          </Row>
        )}
        <AddMutationModalDropdown
          label="Type"
          options={typeOptions}
          value={typeOptions.find(option => option.label === alterationData.type)}
          onChange={newValue => handleFieldChange(newValue?.label, 'type', alterationIndex, excludingIndex)}
        />
        <AddMutationModalField
          label="Alteration"
          value={
            notNullOrUndefined(alterationData.alterationFieldValueWhileFetching)
              ? alterationData.alterationFieldValueWhileFetching
              : getFullAlterationName(alterationData, notNullOrUndefined(excludingIndex) ? false : true)
          }
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
          value={alterationData.proteinChange}
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
          value={consequenceOptions.find(option => option.label === alterationData.consequence)}
          options={consequenceOptions}
          menuPlacement="top"
          onChange={newValue => handleFieldChange(newValue?.label, 'consequence', alterationIndex, excludingIndex)}
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
          value={alterationData.genes?.map(gene => gene.hugoSymbol).join(', ')}
          placeholder="Input genes"
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
        <Row className="align-items-center mb-3">
          <Col className="px-0 col-3 mr-3">
            <span className="mr-2">Excluding</span>
            {!isSectionEmpty && (
              <>
                {excludingCollapsed ? (
                  <FaChevronDown style={{ cursor: 'pointer' }} onClick={isSectionEmpty ? null : () => setExcludingCollapsed(false)} />
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
              onInputChange={newInput => setExcludingInputValue(newInput)}
              value={tabStates[alterationIndex].excluding.map(state => {
                const fullAlterationName = getFullAlterationName(state, false);
                return { label: fullAlterationName, value: fullAlterationName, ...state };
              })}
              onChange={(newAlterations: AlterationData[]) =>
                setTabStates(states => {
                  const newStates = _.cloneDeep(states);
                  newStates[alterationIndex].excluding = newStates[alterationIndex].excluding.filter(state =>
                    newAlterations.some(alt => getFullAlterationName(alt) === getFullAlterationName(state))
                  );
                  return newStates;
                })
              }
              onKeyDown={event => handleKeyDownExcluding(event, alterationIndex)}
            />
          </Col>
        </Row>
        {!isSectionEmpty && (
          <Row className="align-items-center">
            <Col className="px-0">
              <div className="pr-3">
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

  function getErrorSection(alterationData: AlterationData, alterationIndex: number, excludingIndex?: number) {
    const suggestion = new RegExp('The alteration name is invalid, do you mean (.+)\\?').exec(alterationData.error)?.[1];

    return (
      <div>
        <Row>
          <Col className="px-0">
            <Alert color="danger" className="alteration-message" fade={false}>
              {alterationData.error}
            </Alert>
          </Col>
        </Row>
        <Row>
          {suggestion && (
            <Col className="px-0 d-flex justify-content-end" style={{ marginTop: '-10px' }}>
              <Button
                className="mr-1"
                color="danger"
                outline
                size="sm"
                onClick={() => {
                  setTabStates(states => {
                    const newStates = _.cloneDeep(states);
                    if (notNullOrUndefined(excludingIndex)) {
                      newStates[alterationIndex].excluding.splice(excludingIndex, 1);
                    } else {
                      newStates.splice(alterationIndex, 1);
                    }
                    return newStates;
                  });

                  inputRef.current.focus();
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
            </Col>
          )}
        </Row>
      </div>
    );
  }

  return (
    <Modal isOpen>
      <ModalBody>
        <div>
          <CreatableSelect
            className="mb-3"
            ref={inputRef}
            components={{
              DropdownIndicator: null,
            }}
            isMulti
            menuIsOpen={false}
            placeholder="Enter alteration(s)"
            inputValue={inputValue}
            onInputChange={newInput => setInputValue(newInput)}
            value={tabStates.map(state => {
              const fullAlterationName = getFullAlterationName(state);
              return { label: fullAlterationName, value: fullAlterationName, ...state };
            })}
            onChange={(newAlterations: AlterationData[]) =>
              setTabStates(states =>
                states.filter(state => newAlterations.some(alt => getFullAlterationName(alt) === getFullAlterationName(state)))
              )
            }
            onKeyDown={handleKeyDown}
          />
          {tabStates.length > 0 && (
            <div className="pr-3">
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
        </div>
      </ModalBody>
      <ModalFooter style={{ display: 'inline-block' }}>
        <div className="d-flex justify-content-between">
          {mutationAlreadyExists ? (
            <div className={styles.warning}>
              <FaExclamationCircle className="mr-2" size={'25px'} />
              <span>Mutation already exists</span>
            </div>
          ) : (
            <div />
          )}
          <div>
            <Button className="mr-2" onClick={onCancel} outline color="danger">
              Cancel
            </Button>
            <Button
              onClick={() => {
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

                onConfirm(tabStates.map(state => convertAlterationDataToAlteration(state)));
              }}
              color="primary"
              disabled={
                tabStates.length === 0 || mutationAlreadyExists || tabStates.some(tab => tab.error || tab.excluding.some(ex => ex.error))
              }
            >
              {mutationToEdit ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

interface IAddMutationModalFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (newValue: string) => void;
}

function AddMutationModalField({ label, value: value, placeholder, onChange }: IAddMutationModalFieldProps) {
  return (
    <Row className="align-items-center mb-3">
      <Col className="px-0 col-3 mr-3">
        <span>{label}</span>
      </Col>
      <Col className="px-0">
        <Input
          value={value}
          onChange={event => {
            onChange(event.target.value);
          }}
          placeholder={placeholder}
        />
      </Col>
    </Row>
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
  onChange: (newValue: DropdownOption) => void;
}

function AddMutationModalDropdown({ label, value, options, menuPlacement, onChange }: IAddMutationModalDropdownProps) {
  return (
    <Row className="align-items-center mb-3">
      <Col className="px-0 col-3 mr-3">
        <span>{label}</span>
      </Col>
      <Col className="px-0">
        <ReactSelect value={value} options={options} onChange={onChange} menuPlacement={menuPlacement} isClearable />
      </Col>
    </Row>
  );
}

const mapStoreToProps = ({ alterationStore, consequenceStore, geneStore }: IRootStore) => ({
  annotateAlteration: flow(alterationStore.annotateAlteration),
  geneEntities: geneStore.entities,
  consequences: consequenceStore.entities,
  getConsequences: consequenceStore.getEntities,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(AddMutationModal);
