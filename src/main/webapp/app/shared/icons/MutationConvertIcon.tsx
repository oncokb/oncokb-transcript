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
  mutationName: string;
  mutationNameReview?: Review;
}

const MutationConvertIcon = ({
  firebaseDb,
  mutationList,
  mutationName,
  mutationNameReview,
  color,
  onClick,
  tooltipProps,
  ...actionIconProps
}: IMutationConvertIconProps) => {
  const [errorMessage, setErrorMessage] = useState(null);

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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setErrorMessage('Cannot demote to VUS because alteration(s) exists in another mutation');
      } else {
        setErrorMessage(null);
      }
      if (mutationNameReview?.added || mutationNameReview?.promotedToMutation) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setErrorMessage('Mutation is newly created. Please accept/reject in review mode.');
      }
      if (mutationNameReview?.lastReviewed) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setErrorMessage('Mutation name changed. Please accept/reject in review mode.');
      }
    }
  }, [mutationList, mutationName, mutationNameReview]);

  if (errorMessage) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tooltipProps.overlay = <div>{errorMessage}</div>;
  }

  return (
    <ActionIcon
      {...actionIconProps}
      icon={faExchangeAlt}
      color={color || PRIMARY}
      onClick={e => {
        if (!errorMessage) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onClick(e);
        }
      }}
      tooltipProps={tooltipProps}
      disabled={!!errorMessage}
    />
  );
};

const mapStoreToProps = ({ firebaseAppStore, firebaseMutationConvertIconStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
  mutationList: firebaseMutationConvertIconStore.data,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationConvertIcon));
