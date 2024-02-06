import Tabs from 'app/components/tabs/tabs';
import React, { KeyboardEventHandler, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, Modal, ModalBody, ModalFooter, Row } from 'reactstrap';
import CreatableSelect from 'react-select/creatable';
import ValidatedForm from 'app/shared/form/ValidatedForm';
import { ValidatedField, ValidatedSelect } from 'app/shared/form/ValidatedField';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import _ from 'lodash';
import { generateUuid, parseAlterationName } from '../util/utils';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { flow, flowResult } from 'mobx';
import { CancellablePromise } from 'mobx/dist/internal';
import { EntityStatusAlteration } from '../api/generated';
import './add-mutation-modal.scss';
import { IGene } from '../model/gene.model';
import { FaChevronDown, FaChevronUp, FaExclamationTriangle } from 'react-icons/fa';
import { Alteration, Mutation } from '../model/firebase/firebase.model';

// Follow naming convention: all words start with uppercase, and space are denoted by _
// This is used to populate field names
type MutationState = {
  label: string;
  value: string;
  uuid: string;
  Alteration: string;
  Name: string;
  Protein_Change: string;
  Protein_Start: string;
  Protein_End: string;
  Ref_Residues: string;
  Var_Residues: string;
  Consequence: string;
  Comment?: string;
  Excluding: MutationState[];
  warning?: string;
  error?: string;
};

type MutationName = {
  name: string;
  excluding: string[];
  comment: string;
};

interface IAddMutationModalProps extends StoreProps {
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
  hugoSymbol,
  mutationToEdit,
  annotateAlteration,
  geneEntities,
  consequences,
  getConsequences,
  onConfirm,
  onCancel,
}: Omit<IAddMutationModalProps, 'isOpen'>) {
  const consequenceOptions = consequences.map(consequence => ({ label: consequence.name, value: consequence.id }));

  const [inputValue, setInputValue] = useState('');
  const [mutationStates, setMutationStates] = useState<MutationState[]>([]);
  const [excludingCollapsed, setExcludingCollapsed] = useState(true);

  const inputRef = useRef(null);

  const geneEntity: IGene | undefined = useMemo(() => {
    return geneEntities.find(gene => gene.hugoSymbol === hugoSymbol);
  }, [geneEntities]);

  useEffect(() => {
    getConsequences({});
  }, []);

  useEffect(() => {
    if (mutationToEdit) {
      mutationToEdit.name.split(', ').map(name => fetchAlteration(name));
    }
  }, []);

  function getFullMutationName(name: string, comment: string, excluding: string[]) {
    let fullName = name;
    if (excluding.length > 0) {
      fullName += ' {excluding ' + excluding.join(' ; ') + '}';
    }
    if (comment) {
      fullName += ' (' + comment + ')';
    }
    return fullName;
  }

  function updateExcludingAlterations(parentState: MutationState, excludingUuid: string, newExcludingName: string) {
    let oldExcludingAlterationNames = parentState.Excluding.map(excluded => excluded.Alteration).join(' ; ');
    let newExcludingAlterationNames: string = parentState.Excluding.map(excluded => {
      if (excluded.uuid === excludingUuid) {
        return newExcludingName;
      }
      return excluded.Alteration;
    }).join(' ; ');

    oldExcludingAlterationNames = `{excluding ${oldExcludingAlterationNames}}`;
    newExcludingAlterationNames = newExcludingAlterationNames ? `{excluding ${newExcludingAlterationNames}}` : '';

    parentState.label = parentState.Alteration.replace(oldExcludingAlterationNames, newExcludingAlterationNames);
    parentState.value = parentState.Alteration.replace(oldExcludingAlterationNames, newExcludingAlterationNames);
    parentState.Alteration = parentState.Alteration.replace(oldExcludingAlterationNames, newExcludingAlterationNames);
  }

  function parseMutationName(mutationName: string): MutationName {
    const regex = new RegExp('({ *excluding[^}]+})', 'i');
    const excludingSection = regex.exec(mutationName);
    let mutationNameWithoutExcluding = mutationName;
    const excluding: string[] = [];
    if (excludingSection?.length > 1) {
      mutationNameWithoutExcluding = mutationName.replace(excludingSection[1], '');

      excludingSection[1] = excludingSection[1].slice(1, -1); // remove curly braces
      excludingSection[1] = excludingSection[1].replace(/excluding/i, '');
      const excludedNames = excludingSection[1].split(';');
      for (const name of excludedNames) {
        excluding.push(...parseAlterationName(name.trim()));
      }
    }

    const parentheses = [];
    let comment = '';
    for (const c of mutationName) {
      if (c === '(') {
        if (parentheses.length > 0) {
          comment += c;
        }
        parentheses.push(c);
      } else if (c === ')') {
        parentheses.pop();
        if (parentheses.length > 0) {
          comment += c;
        }
      } else if (parentheses.length > 0) {
        comment += c;
      }

      if (parentheses.length === 0 && comment.length > 0) {
        break;
      }
    }

    mutationNameWithoutExcluding = mutationNameWithoutExcluding.replace('(' + comment + ')', '');

    return {
      name: mutationNameWithoutExcluding,
      excluding,
      comment,
    };
  }

  async function fetchAlteration(newName: string, uuid?: string, excludingUuid?: string) {
    const { name: parsedMutationName, excluding, comment } = parseMutationName(newName);

    const mutationOptionsToAdd = parseAlterationName(parsedMutationName.trim()).map(name => {
      const mutationName = getFullMutationName(name, comment, excluding);

      return {
        label: mutationName,
        value: mutationName,
        uuid: generateUuid(),
        parsedAlterationName: name,
      };
    });

    const alterationPromises: CancellablePromise<EntityStatusAlteration>[] = [];
    const excludingPromises: CancellablePromise<EntityStatusAlteration>[] = [];
    let firstIteration = true;
    for (const mutationOption of mutationOptionsToAdd) {
      if (
        mutationStates.some(
          mutation =>
            getFullMutationName(
              mutation.Name,
              mutation.Comment,
              mutation.Excluding.map(excluded => excluded.Name)
            ).toLowerCase() === mutationOption.value.toLowerCase()
        )
      ) {
        notifyError(new Error('Alteration names must be distinct'));
        return;
      }

      alterationPromises.push(
        flowResult(annotateAlteration({ alteration: mutationOption.parsedAlterationName, geneIds: [geneEntity.id] }, false))
      );

      if (firstIteration) {
        for (const excluded of excluding) {
          excludingPromises.push(flowResult(annotateAlteration({ alteration: excluded, geneIds: [geneEntity.id] }, false)));
        }
      }
      firstIteration = false;
    }
    const allAlterations = await Promise.all([...alterationPromises, ...excludingPromises]);
    const alterations = allAlterations.slice(0, alterationPromises.length);
    const excludingAlterations = allAlterations.slice(alterationPromises.length);

    const newAlterations = alterations.map((alteration, index) => {
      return {
        label: mutationOptionsToAdd[index].label,
        value: mutationOptionsToAdd[index].label,
        uuid: mutationOptionsToAdd[index].uuid,
        Alteration: mutationOptionsToAdd[index].label,
        Name: alteration.entity?.name || '',
        Protein_Change: alteration.entity?.proteinChange,
        Protein_Start: alteration.entity?.start?.toString() || '',
        Protein_End: alteration.entity?.end?.toString() || '',
        Ref_Residues: alteration.entity?.refResidues || '',
        Var_Residues: alteration.entity?.variantResidues || '',
        Consequence: alteration.entity?.consequence?.name || '',
        Comment: comment,
        Excluding: excludingAlterations.map(excludingAlteration => ({
          label: excludingAlteration.entity?.alteration,
          value: excludingAlteration.entity?.alteration,
          uuid: generateUuid(),
          Alteration: excludingAlteration.entity?.alteration || '',
          Name: excludingAlteration.entity?.name || '',
          Protein_Change: excludingAlteration.entity?.proteinChange,
          Protein_Start: excludingAlteration.entity?.start?.toString() || '',
          Protein_End: excludingAlteration.entity?.end?.toString() || '',
          Ref_Residues: excludingAlteration.entity?.refResidues || '',
          Var_Residues: excludingAlteration.entity?.variantResidues || '',
          Consequence: excludingAlteration.entity?.consequence?.name || '',
          Excluding: [],
          warning: excludingAlteration.warning ? excludingAlteration.message : null,
          error: excludingAlteration.error ? excludingAlteration.message : null,
        })),
        warning: alteration.warning ? alteration.message : null,
        error: alteration.error ? alteration.message : null,
      };
    });

    function replaceOldMutations(oldMutationStates: MutationState[], newMutations: MutationState[], uuidToReplace: string) {
      return oldMutationStates.reduce((accumulator: MutationState[], currentMutation) => {
        if (uuidToReplace === currentMutation.uuid) {
          return [...accumulator, ...newMutations];
        }
        return [...accumulator, currentMutation];
      }, []);
    }

    setMutationStates(prev => {
      if (excludingUuid) {
        const newMutationStates = _.cloneDeep(prev);
        const parentState = newMutationStates.find(state => state.uuid === uuid);
        newAlterations.forEach(newAlteration => (newAlteration.Comment = null));
        parentState.Excluding = replaceOldMutations(parentState.Excluding, newAlterations, excludingUuid);
        return newMutationStates;
      }

      if (uuid) {
        return replaceOldMutations(prev, newAlterations, uuid);
      }

      return [...prev, ...newAlterations];
    });
  }

  const handleAlterationChange = useCallback(
    _.debounce(async (newAlteration: string, uuid: string, excludingUuid?: string) => {
      await fetchAlteration(newAlteration, uuid, excludingUuid);
    }, 1000),
    []
  );

  const handleKeyDown: KeyboardEventHandler = async event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      await fetchAlteration(inputValue);

      setInputValue('');
      event.preventDefault();
    }
  };

  function getTabTitle(mutationState: MutationState) {
    if (!mutationState) {
      // loading state
      return <></>;
    }

    if (mutationState.error) {
      return (
        <span>
          <FaExclamationTriangle className="text-danger mr-1 mb-1" />
          {mutationState.Alteration}
        </span>
      );
    }

    if (mutationState.warning) {
      return (
        <span>
          <FaExclamationTriangle className="text-warning mr-1 mb-1" />
          {mutationState.Alteration}
        </span>
      );
    }

    return mutationState.Alteration;
  }

  function getTabContent(mutationState: MutationState) {
    if (!mutationState) {
      // loading state
      return <></>;
    }

    let mutationStateIndex = mutationStates.indexOf(mutationState);
    let excludingStateIndex = -1;
    let parentMutationState: MutationState = null;
    if (mutationStateIndex === -1) {
      parentMutationState = mutationStates.find(state => state.Excluding.some(excluded => excluded.uuid === mutationState.uuid));
      mutationStateIndex = mutationStates.indexOf(parentMutationState);
      excludingStateIndex = mutationStates[mutationStateIndex].Excluding.indexOf(mutationState);
    }

    if (mutationState.error) {
      const suggestion = new RegExp('The alteration name is invalid, do you mean (.+)\\?').exec(mutationState.error)[1];

      return (
        <div>
          <Row>
            <Col className="px-0">
              <Alert color="danger" className="alteration-message" fade={false}>
                {mutationState.error}
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
                    if (parentMutationState) {
                      // remove form alteration name and refetch
                      const newState = _.cloneDeep(mutationStates);
                      updateExcludingAlterations(newState[mutationStateIndex], mutationState.uuid, '');
                      setMutationStates(newState);
                      fetchAlteration(newState[mutationStateIndex].Alteration, newState[mutationStateIndex].uuid);
                    } else {
                      const newState = _.cloneDeep(mutationStates);
                      setMutationStates(newState.filter(state => state.uuid !== mutationState.uuid));
                      inputRef.current.focus();
                    }
                  }}
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    if (parentMutationState) {
                      const newState = _.cloneDeep(mutationStates);
                      updateExcludingAlterations(newState[mutationStateIndex], mutationState.uuid, suggestion);
                      setMutationStates(newState);

                      fetchAlteration(suggestion, parentMutationState.uuid, mutationState.uuid);
                    } else {
                      const excluding =
                        mutationState.Excluding.length > 0
                          ? `{excluding ${mutationState.Excluding.map(exc => exc.Alteration).join(', ')}}`
                          : '';
                      const comment = mutationState.Comment ? `(${mutationState.Comment})` : '';
                      fetchAlteration(`${suggestion} ${excluding} ${comment}`, mutationState.uuid);
                    }
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
      <div>
        {mutationState.warning && (
          <Row>
            <Col className="px-0">
              <Alert color="warning" className="alteration-message" fade={false}>
                {mutationState.warning}
              </Alert>
            </Col>
          </Row>
        )}
        <ValidatedForm key={mutationState.uuid} defaultValues={[]} onSubmit={() => {}}>
          {Object.keys(mutationState).map(mutationField => {
            const fieldLabel = mutationField.replace('_', ' ');

            if (
              mutationField === 'uuid' ||
              mutationField === 'error' ||
              mutationField === 'warning' ||
              mutationField === 'label' ||
              mutationField === 'value'
            ) {
              return;
            }

            if (mutationField === 'Excluding') {
              return mutationState[mutationField].length > 0 ? (
                <div key={mutationField}>
                  <Row className="align-items-center mb-4">
                    <Col className="px-0">
                      <span className="mr-2">{fieldLabel}</span>
                      {excludingCollapsed ? (
                        <FaChevronDown style={{ cursor: 'pointer' }} onClick={() => setExcludingCollapsed(false)} />
                      ) : (
                        <FaChevronUp style={{ cursor: 'pointer' }} onClick={() => setExcludingCollapsed(true)} />
                      )}
                    </Col>
                  </Row>
                  <Row className="align-items-center">
                    <Col className="px-0">
                      <div className="pr-3">
                        <Tabs
                          tabs={mutationState[mutationField].map(state => ({
                            title: getTabTitle(state),
                            content: getTabContent(state),
                          }))}
                          isCollapsed={excludingCollapsed}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              ) : (
                <></>
              );
            }

            if (mutationField === 'Consequence') {
              return (
                <Row className="align-items-center" key={mutationField}>
                  <Col className="mb-3 px-0 col-3 mr-3">
                    <span>{fieldLabel}</span>
                  </Col>
                  <Col className="px-0">
                    <ValidatedSelect
                      value={consequenceOptions.find(option => option.label === mutationState[mutationField])}
                      name={mutationField}
                      options={consequences.map(consequence => ({ label: consequence.name, value: consequence.id }))}
                      onChange={newValue => {
                        setMutationStates(state => {
                          const newState = _.cloneDeep(state);

                          if (excludingStateIndex !== -1) {
                            // we are in excluding form
                            newState[mutationStateIndex].Excluding[excludingStateIndex][mutationField] = newValue?.label;
                            return newState;
                          }

                          newState[mutationStateIndex][mutationField] = newValue?.label;
                          return newState;
                        });
                      }}
                      menuPlacement="top"
                      isClearable
                    />
                  </Col>
                </Row>
              );
            }

            return (
              <Row className="align-items-center" key={mutationField}>
                <Col className="mb-3 px-0 col-3 mr-3">
                  <span>{fieldLabel}</span>
                </Col>
                <Col className="px-0">
                  <ValidatedField
                    value={mutationState[mutationField]}
                    id={mutationField}
                    name={mutationField}
                    data-cy={mutationField}
                    type={'text'}
                    validate={{
                      required: {
                        value: mutationField === 'Alteration' || mutationField === 'Name',
                        message: 'This field is required.',
                      },
                    }}
                    onChange={event => {
                      setMutationStates(state => {
                        const newState = _.cloneDeep(state);

                        if (excludingStateIndex !== -1) {
                          // we are in excluding form
                          if (mutationField === 'Alteration') {
                            updateExcludingAlterations(newState[mutationStateIndex], mutationState.uuid, event.target.value);
                          }

                          newState[mutationStateIndex].Excluding[excludingStateIndex][mutationField] = event.target.value;
                          return newState;
                        }

                        newState[mutationStateIndex][mutationField] = event.target.value;

                        if (mutationField === 'Alteration') {
                          newState[mutationStateIndex].label = event.target.value;
                          newState[mutationStateIndex].value = event.target.value;
                          return newState;
                        }

                        if (mutationField === 'Comment') {
                          newState[mutationStateIndex].Alteration = getFullMutationName(
                            newState[mutationStateIndex].Name,
                            event.target.value,
                            newState[mutationStateIndex].Excluding.map(excluded => excluded.Name)
                          );
                          newState[mutationStateIndex].label = getFullMutationName(
                            newState[mutationStateIndex].Name,
                            event.target.value,
                            newState[mutationStateIndex].Excluding.map(excluded => excluded.Name)
                          );
                          newState[mutationStateIndex].value = getFullMutationName(
                            newState[mutationStateIndex].Name,
                            event.target.value,
                            newState[mutationStateIndex].Excluding.map(excluded => excluded.Name)
                          );
                          return newState;
                        }

                        return newState;
                      });

                      if (mutationField === 'Alteration') {
                        if (parentMutationState) {
                          handleAlterationChange(event.target.value, parentMutationState.uuid, mutationState.uuid);
                        } else {
                          handleAlterationChange(event.target.value, mutationState.uuid);
                        }
                      }
                    }}
                    placeholder={`Input ${fieldLabel.replace(/\b\w/g, match => match.toLowerCase())}`}
                  />
                </Col>
              </Row>
            );
          })}
        </ValidatedForm>
      </div>
    );
  }

  function getAlterationFromMutationState(state: MutationState) {
    const newAlteration = new Alteration();
    newAlteration.alteration = state.Alteration;
    newAlteration.name = state.Name;
    newAlteration.proteinChange = state.Protein_Change;
    newAlteration.proteinStart = state.Protein_Start.trim() === '' ? null : parseInt(state.Protein_Start, 10);
    newAlteration.proteinEnd = state.Protein_End.trim() === '' ? null : parseInt(state.Protein_End, 10);
    newAlteration.refResidues = state.Ref_Residues;
    newAlteration.varResidues = state.Var_Residues;
    newAlteration.consequence = state.Consequence;
    newAlteration.comment = state.Comment || '';
    newAlteration.excluding = state.Excluding.map(excluding => getAlterationFromMutationState(excluding));
    return newAlteration;
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
            placeholder="Enter mutation(s)"
            inputValue={inputValue}
            onInputChange={newInput => setInputValue(newInput)}
            value={mutationStates}
            onChange={(newMutations: MutationState[]) => {
              setMutationStates(states => {
                return states.filter(state => newMutations.some(mutation => mutation.uuid === state.uuid));
              });
            }}
            onKeyDown={handleKeyDown}
          />
          {mutationStates.length > 0 && (
            <div className="pr-3">
              <Tabs
                tabs={mutationStates.map((_option, index) => {
                  return {
                    title: getTabTitle(mutationStates[index]),
                    content: getTabContent(mutationStates[index]),
                  };
                })}
              />
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onCancel} outline color="danger">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(mutationStates.map(state => getAlterationFromMutationState(state)));
          }}
          color="primary"
          disabled={mutationStates.length === 0}
        >
          Add
        </Button>
      </ModalFooter>
    </Modal>
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
