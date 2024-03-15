import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { MutationLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import NestLevelSummary from './NestLevelSummary';
import { onValue, ref } from 'firebase/database';
import { getMutationStats } from 'app/shared/util/firebase/firebase-utils';

export interface MutationLevelSummaryProps extends StoreProps {
  mutationPath: string;
  hideOncogenicity?: boolean;
}

const MutationLevelSummary = ({ mutationPath, firebaseDb, hideOncogenicity = false }: MutationLevelSummaryProps) => {
  const [mutationStats, setMutationStats] = useState(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, mutationPath), snapshot => {
        const calcMutationStats = getMutationStats(snapshot.val());
        setMutationStats(calcMutationStats);
      })
    );
    return () => callbacks.forEach(callback => callback?.());
  }, []);
  return <NestLevelSummary summaryStats={mutationStats} hideOncogenicity={hideOncogenicity} />;
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationLevelSummary));
