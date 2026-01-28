import { ONCOGENICITY_OPTIONS } from 'app/config/constants/firebase';
import { IRootStore } from 'app/stores';
import { onValue, ref, Unsubscribe } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { FIREBASE_ONCOGENICITY, MutationRange, RangeList } from '../model/firebase/firebase.model';
import { getDescriptionFromRange, getFirebaseRangesPath } from '../util/firebase/firebase-utils';
import { componentInject } from '../util/typed-inject';

enum AddRangeStep {
  POSITION = 1,
  CRITERIA,
  ALIAS,
  DESCRIPTION,
}
const addRangeStepLength = Object.keys(AddRangeStep).length / 2;
const mutationTypes = ['Missense', 'Insertion', 'Deletion'];

export interface IAddRangeModalProps extends StoreProps {
  hugoSymbol: string;
  isGermline: boolean;
  onCancel: () => void;
  onConfirm: (alias: string, start: number, end: number, oncogenicities: string[], mutationTypes: string[], description: string) => void;
  rangeToEditPath?: string;
}

function AddRangeModal({ hugoSymbol, isGermline, onCancel, onConfirm, rangeToEditPath, firebaseDb }: IAddRangeModalProps) {
  const [currentStep, setCurrentStep] = useState(AddRangeStep.POSITION);
  const [position, setPosition] = useState<[number | undefined, number | undefined]>([undefined, undefined]);
  const [selectedOncogenicity, setSelectedOncogenicity] = useState<FIREBASE_ONCOGENICITY[]>([]);
  const [selectedMutationTypes, setSelectedMutationTypes] = useState<string[]>([]);
  const [alias, setAlias] = useState('');
  const [existingAliases, setExistingAliases] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState('');
  const [description, setDescription] = useState('');
  const [initialAlias, setInitialAlias] = useState<string | undefined>(undefined);

  function updateEditedDescription(newDescription: string, ...args: Parameters<typeof getDescriptionFromRange>) {
    const generatedDescription = getDescriptionFromRange(...args);
    if (newDescription === generatedDescription) {
      setEditedDescription('');
    } else {
      setEditedDescription(newDescription);
    }
  }

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, getFirebaseRangesPath(isGermline, hugoSymbol)), snapshot => {
        const ranges: RangeList | undefined = snapshot.val();
        if (ranges) {
          setExistingAliases(Object.values(ranges).map(range => range.alias));
        }
      }),
    );
    if (rangeToEditPath) {
      callbacks.push(
        onValue(ref(firebaseDb, rangeToEditPath), snapshot => {
          const range = snapshot.val() as MutationRange;
          setPosition([range.start, range.end]);
          const oncogencities = range.oncogenicities.split(',') as FIREBASE_ONCOGENICITY[];
          setSelectedOncogenicity(oncogencities);
          const existingMutationTypes = range.mutationTypes.split(',');
          setSelectedMutationTypes(existingMutationTypes);
          setAlias(range.alias);
          setInitialAlias(range.alias);
          setDescription(range.description);
          updateEditedDescription(range.description, range.start, range.end, oncogencities, existingMutationTypes);
          setCurrentStep(AddRangeStep.DESCRIPTION);
        }),
      );
    }

    return () => {
      callbacks.forEach(callback => callback());
    };
  }, [firebaseDb]);

  let errorMessage: string | undefined = undefined;
  switch (currentStep) {
    case AddRangeStep.POSITION:
      errorMessage = validateRange(position[0], position[1]);
      break;
    case AddRangeStep.CRITERIA:
      break;
    case AddRangeStep.ALIAS:
      errorMessage = validateAlias(alias, existingAliases, initialAlias);
      break;
    case AddRangeStep.DESCRIPTION:
      errorMessage = validateDescription(description);
      break;
    default:
  }

  function nextStep() {
    if (currentStep.valueOf() === AddRangeStep.DESCRIPTION.valueOf() - 1 && !editedDescription) {
      setDescription(getDescriptionFromRange(position[0]!, position[1]!, selectedOncogenicity, selectedMutationTypes));
    }
    setCurrentStep(step => step.valueOf() + 1);
  }

  function prevStep() {
    setCurrentStep(step => step.valueOf() - 1);
  }

  function toggleOncogenicity(value: FIREBASE_ONCOGENICITY) {
    setSelectedOncogenicity(prev => {
      const newSelectedOncogenicities = prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value];
      return newSelectedOncogenicities.sort(
        (a, b) => Object.values(FIREBASE_ONCOGENICITY).indexOf(a) - Object.values(FIREBASE_ONCOGENICITY).indexOf(b),
      );
    });
  }

  function toggleMutationType(value: string) {
    setSelectedMutationTypes(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  }

  return (
    <Modal isOpen>
      <ModalHeader toggle={() => onCancel()}>{`Add Range (${currentStep} / ${addRangeStepLength})`}</ModalHeader>
      <ModalBody>
        <Label>Position</Label>
        <div className="d-flex align-items-center gap-2 mb-2">
          <Input
            type="number"
            value={position[0]}
            disabled={currentStep !== AddRangeStep.POSITION}
            placeholder="Start"
            onChange={event => setPosition(pos => [event.target.value ? Number(event.target.value) : undefined, pos[1]])}
          />
          <span>&mdash;</span>
          <Input
            type="number"
            value={position[1]}
            disabled={currentStep !== AddRangeStep.POSITION}
            placeholder="End"
            onChange={event => setPosition(pos => [pos[0], event.target.value ? Number(event.target.value) : undefined])}
          />
        </div>
        {currentStep.valueOf() >= AddRangeStep.CRITERIA.valueOf() && (
          <>
            <Label>Oncogenicity</Label>
            <div className="mb-2">
              {ONCOGENICITY_OPTIONS.map(option => (
                <FormGroup inline check key={option}>
                  <Input
                    disabled={currentStep !== AddRangeStep.CRITERIA}
                    type="checkbox"
                    id={`oncogenicity-${option}`}
                    checked={selectedOncogenicity.includes(option)}
                    onChange={() => toggleOncogenicity(option)}
                  />
                  <Label check for={`oncogenicity-${option}`}>
                    {option}
                  </Label>
                </FormGroup>
              ))}
            </div>
            <Label>Mutation Type</Label>
            <div className="mb-2">
              {mutationTypes.map(option => (
                <FormGroup inline check key={option}>
                  <Input
                    disabled={currentStep !== AddRangeStep.CRITERIA}
                    type="checkbox"
                    id={`mutation-type-${option}`}
                    checked={selectedMutationTypes.includes(option)}
                    onChange={() => toggleMutationType(option)}
                  />
                  <Label check for={`mutation-type-${option}`}>
                    {option}
                  </Label>
                </FormGroup>
              ))}
            </div>
          </>
        )}
        {currentStep.valueOf() >= AddRangeStep.ALIAS.valueOf() && (
          <div className="mb-2">
            <Label>Alias</Label>
            <Input
              disabled={currentStep !== AddRangeStep.ALIAS}
              value={alias}
              placeholder="Enter an alias for the range"
              onChange={event => setAlias(event.target.value)}
            />
          </div>
        )}
        {currentStep.valueOf() >= AddRangeStep.DESCRIPTION.valueOf() && (
          <>
            <Label>Description</Label>
            <Input
              value={description}
              placeholder="Enter an alias for the range"
              onChange={event => {
                setDescription(event.target.value);
                updateEditedDescription(event.target.value, position[0]!, position[1]!, selectedOncogenicity, selectedMutationTypes);
              }}
            />
          </>
        )}
      </ModalBody>
      <ModalFooter className="d-flex justify-content-between">
        {currentStep.valueOf() === 1 ? (
          <Button outline color="danger" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button outline color="danger" onClick={prevStep}>
            Previous
          </Button>
        )}
        <span className="text-danger">{errorMessage}</span>
        {currentStep.valueOf() < addRangeStepLength ? (
          <Button disabled={!!errorMessage} outline color="primary" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button
            disabled={!!errorMessage}
            color="primary"
            onClick={() => {
              onConfirm(alias, position[0]!, position[1]!, selectedOncogenicity, selectedMutationTypes, editedDescription || description);
            }}
          >
            Confirm
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(AddRangeModal));

function validateRange(start: number | undefined, end: number | undefined): string | undefined {
  if (start === undefined || end === undefined) {
    return 'Start and end must both be specified';
  }
  if (start >= end) {
    return 'Start must be less than end.';
  }
  return undefined;
  // TODO: transcript validation
}

function validateAlias(alias: string, existingAliases: string[], existingAlias?: string) {
  alias = alias.trim();
  if (!alias) {
    return 'Alias must be specified.';
  }
  if (
    existingAliases.some(
      existing => alias.toLowerCase() === existing.toLowerCase() && existing.toLowerCase() !== existingAlias?.toLowerCase(),
    )
  ) {
    return 'Alias already exists.';
  }
  return undefined;
}

function validateDescription(description: string) {
  description = description.trim();
  if (!description) {
    return 'Description must be specified';
  }
  return undefined;
}
