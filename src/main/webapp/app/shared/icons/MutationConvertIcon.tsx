import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import ActionIcon, { IActionIcon } from './ActionIcon';
import { PRIMARY } from 'app/config/colors';
import { Mutation, Review } from '../model/firebase/firebase.model';
import { onValue, ref } from 'firebase/database';
import { IRootStore } from 'app/stores';
import { componentInject } from '../util/typed-inject';
import { observer } from 'mobx-react';
import { parseAlterationName } from '../util/utils';

export interface IMutationConvertIconProps extends Omit<IActionIcon, 'icon'>, StoreProps {
  convertTo: 'vus' | 'mutation';
  mutationName: string;
  mutationNameReview?: Review;
  mutationUuid?: string;
  firebaseMutationsPath?: string;
}

const MutationConvertIcon = ({
  firebaseDb,
  convertTo,
  firebaseMutationsPath,
  mutationName,
  mutationUuid,
  mutationNameReview,
  color,
  onClick,
  tooltipProps,
  ...actionIconProps
}: IMutationConvertIconProps) => {
  const [mutationList, setMutationList] = useState<Mutation[]>(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let unsubscribe;
    if (convertTo === 'vus') {
      unsubscribe = onValue(ref(firebaseDb, firebaseMutationsPath), snapshot => {
        setMutationList(snapshot.val());
      });
    }
    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    if (mutationList) {
      const newMutationName = parseAlterationName(mutationName)[0]
        .alteration.split(',')
        .map(alteration => alteration.trim());
      const exists = mutationList
        ?.filter(mutation => mutation.name !== mutationName)
        .some(
          mutation =>
            parseAlterationName(mutation.name)[0]
              .alteration.split(', ')
              .filter(alterationName => newMutationName.some(part => part === alterationName)).length > 0
        );
      if (exists) {
        setErrorMessage('Cannot demote to VUS because alteration(s) exists in another mutation');
      }
      if (mutationNameReview?.added || mutationNameReview?.promotedToMutation) {
        setErrorMessage('Mutation is newly created. Please accept/reject in review mode.');
      }
    }
  }, [mutationList]);

  if (errorMessage) {
    tooltipProps.overlay = <div>{errorMessage}</div>;
  }

  return (
    <ActionIcon
      {...actionIconProps}
      icon={faExchangeAlt}
      color={color || PRIMARY}
      onClick={e => {
        if (!errorMessage) {
          onClick(e);
        }
      }}
      tooltipProps={tooltipProps}
      disabled={!!errorMessage}
    />
  );
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationConvertIcon));
