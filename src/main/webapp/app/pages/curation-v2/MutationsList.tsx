import React, { useEffect, useState } from 'react';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { observer } from 'mobx-react';
import { Mutation } from 'app/shared/model/firebase/firebase.model';
import { ref, onValue } from 'firebase/database';
import _ from 'lodash';
import { ViewportList, ViewportListPropsBase } from 'react-viewport-list';
import MutationCollapsible from './MutationCollapsible';
import { ParsedHistoryRecord } from './CurationPage';

export interface MutationsList extends StoreProps, ViewportListPropsBase {
  mutationsPath: string;
  hugoSymbol: string;
  parsedHistoryList: Map<string, ParsedHistoryRecord[]>;
  onToggle?: (firebaseIndex: number) => void;
  filter?: (firebaseIndex: number) => boolean;
  onLengthChange?: (oldLength: number, newLength: number) => void;
  defaultSort?: (a: Mutation, b: Mutation) => number;
}

type FirebaseMutation = Mutation & { firebaseIndex: number };

function MutationsList({
  mutationsPath,
  hugoSymbol,
  parsedHistoryList,
  onToggle,
  filter,
  onLengthChange,
  defaultSort,
  firebaseDb,
  ...rest
}: MutationsList) {
  const [firebaseMutations, setFirebaseMutations] = useState<FirebaseMutation[]>(null);

  useEffect(() => {
    const mutationsListRef = ref(firebaseDb, mutationsPath);
    const unsubscribe = onValue(mutationsListRef, snapshot => {
      const newMutations = snapshot.val() as Mutation[];

      if (!firebaseMutations) {
        const newFirebaseMutations: FirebaseMutation[] = newMutations.map((mutation, firebaseIndex) => ({ ...mutation, firebaseIndex }));
        setFirebaseMutations(defaultSort ? newFirebaseMutations.sort(defaultSort) : newFirebaseMutations);
      } else if (firebaseMutations.length !== snapshot.size) {
        const addedFirebaseMutations: FirebaseMutation[] = [];
        for (let i = 0; i < newMutations.length; i++) {
          if (!firebaseMutations.some(firebaseMutation => firebaseMutation.name_uuid === newMutations[i].name_uuid)) {
            addedFirebaseMutations.push({ ...newMutations[i], firebaseIndex: i });
          } else {
            // assume always pushing to front
            break;
          }
        }

        setFirebaseMutations(oldFirebaseMutations => {
          const newFirebaseMutations = _.cloneDeep(oldFirebaseMutations);
          newFirebaseMutations.forEach(firebaseMutation => (firebaseMutation.firebaseIndex += addedFirebaseMutations.length));

          return newFirebaseMutations;
        });

        onLengthChange(firebaseMutations.length, snapshot.size);
      }
    });

    return () => unsubscribe?.();
  }, [firebaseMutations, onLengthChange, defaultSort]);

  function getMutationsList() {
    if (!firebaseMutations) {
      return [];
    }

    if (!filter) {
      return firebaseMutations;
    }
    return firebaseMutations.filter(firebaseMutation => filter(firebaseMutation.firebaseIndex));
  }

  return (
    <ViewportList {...rest} items={getMutationsList()}>
      {item => (
        <MutationCollapsible
          disableOpen
          mutationPath={`${mutationsPath}/${item.firebaseIndex}`}
          hugoSymbol={hugoSymbol}
          parsedHistoryList={parsedHistoryList}
          onToggle={() => onToggle(item.firebaseIndex)}
        />
      )}
    </ViewportList>
  );
}

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationsList));
