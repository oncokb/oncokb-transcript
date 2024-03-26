import React, { useEffect, useRef, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Mutation, VusObjList } from '../model/firebase/firebase.model';
import { parseAlterationName } from '../util/utils';
import _ from 'lodash';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { DefaultAddMutationModal } from './DefaultAddMutationModal';
import { getDuplicateMutations, getFirebasePath } from '../util/firebase/firebase-utils';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { Button, Col, Row } from 'reactstrap';

export interface IAddVusModalProps extends StoreProps {
  hugoSymbol: string;
  vusList: VusObjList;
  onCancel: () => void;
  onConfirm: (variants: string[]) => void;
}

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

const AddVusModalV2 = (props: IAddVusModalProps) => {
  const firebaseMutationPath = `${getFirebasePath('GENE', props.hugoSymbol)}/mutations`;
  const [mutationList, setMutationList] = useState<Mutation[]>(undefined);
  const [duplicateAlterations, setDuplicateAlterations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [variants, setVariants] = useState<readonly Option[]>([]);

  // need to focus input once this is fetched
  const [mutationListInitialized, setMutationListInitialized] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const subscribe = onValue(ref(props.firebaseDb, firebaseMutationPath), snapshot => {
      setMutationList(snapshot.val());
      if (!mutationListInitialized) {
        setMutationListInitialized(true);
      }
    });
    return () => subscribe();
  }, []);

  useEffect(() => {
    if (mutationList) {
      const dupAlts = getDuplicateMutations(
        variants.map(o => o.label),
        mutationList,
        props.vusList,
        { useFullAlterationName: false, exact: false }
      );
      setDuplicateAlterations(Array.from(dupAlts));
    }
  }, [variants, mutationList, props.vusList]);

  useEffect(() => {
    if (mutationListInitialized) {
      inputRef.current?.focus();
    }
  }, [mutationListInitialized]);

  function handleVariantAdded() {
    const filteredAlterations = filterAlterationsAndNotify(inputValue);
    setVariants(state => [...state, ...filteredAlterations.map(alt => createOption(alt))]);
    setInputValue('');
  }

  const handleKeyDown = event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      handleVariantAdded();
      event.preventDefault();
    }
  };

  const filterAlterationsAndNotify = (variant: string) => {
    const currentVariants = variants.map(o => o.label.toLowerCase());
    const alterations = parseAlterationName(variant);
    const filteredAlterations = alterations.filter(alt => {
      if (currentVariants.includes(alt.alteration.toLowerCase())) {
        return false;
      }
      return true;
    });
    if (alterations.length !== filteredAlterations.length) {
      notifyError(new Error('Duplicate alteration(s) removed'));
    }
    return filteredAlterations.map(a => a.alteration);
  };

  const selectComponent = (
    <CreatableSelect
      ref={inputRef}
      components={{
        DropdownIndicator: null,
      }}
      isMulti
      isClearable
      menuIsOpen={false}
      onChange={newValue => setVariants(newValue)}
      onInputChange={(newValue, { action }) => {
        if (action !== 'menu-close' && action !== 'input-blur') {
          setInputValue(newValue);
        }
      }}
      onKeyDown={handleKeyDown}
      placeholder="Enter variant"
      value={variants}
      inputValue={inputValue}
    />
  );

  const warningMessage = duplicateAlterations.length > 0 ? `The mutation(s) ${duplicateAlterations.join(', ')} already exist.` : undefined;

  return (
    <DefaultAddMutationModal
      modalBody={
        <Row className="align-items-center mb-3">
          <Col className="pr-0">{selectComponent}</Col>
          <Col className="col-auto pl-2">
            <Button color="primary" disabled={!inputValue} onClick={handleVariantAdded}>
              Add
            </Button>
          </Col>
        </Row>
      }
      onCancel={props.onCancel}
      onConfirm={() => props.onConfirm(variants.map(o => o.label))}
      confirmButtonDisabled={duplicateAlterations.length > 0 || variants.length < 1}
      warningMessage={warningMessage}
    />
  );
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(AddVusModalV2));
