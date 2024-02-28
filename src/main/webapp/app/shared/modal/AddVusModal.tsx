import React, { useEffect, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { Mutation, VusObjList } from '../model/firebase/firebase.model';
import { parseAlterationName } from '../util/utils';
import _ from 'lodash';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { DefaultAddMutationModal } from './DefaultAddMutationModal';
import { getDuplicateMutations } from '../util/firebase/firebase-utils';

export interface IAddVusModalProps {
  mutationList: Mutation[];
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

export const AddVusModal = (props: IAddVusModalProps) => {
  const [duplicateAlterations, setDuplicateAlterations] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [variants, setVariants] = useState<readonly Option[]>([]);

  useEffect(() => {
    const dupAlts = getDuplicateMutations(
      variants.map(o => o.label),
      props.mutationList,
      props.vusList,
      { useFullAlterationName: false, exact: false }
    );
    setDuplicateAlterations(Array.from(dupAlts));
  }, [variants, props.mutationList, props.vusList]);

  const handleKeyDown = event => {
    if (!inputValue) return;
    if (event.key === 'Enter' || event.key === 'tab') {
      const filteredAlterations = filterAlterationsAndNotify(inputValue);
      setVariants(state => [...state, ...filteredAlterations.map(alt => createOption(alt))]);
      setInputValue('');
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
      className="mb-3"
      components={{
        DropdownIndicator: null,
      }}
      isMulti
      isClearable
      menuIsOpen={false}
      onChange={newValue => setVariants(newValue)}
      onInputChange={newValue => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder="Enter variant and press enter"
      value={variants}
      inputValue={inputValue}
    />
  );

  const warningMessage = duplicateAlterations.length > 0 ? `The mutation(s) ${duplicateAlterations.join(', ')} already exist.` : undefined;

  return (
    <DefaultAddMutationModal
      modalBody={selectComponent}
      onCancel={props.onCancel}
      onConfirm={() => props.onConfirm(variants.map(o => o.label))}
      confirmButtonDisabled={duplicateAlterations.length > 0 || variants.length < 1}
      warningMessage={warningMessage}
    />
  );
};
