import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { MutationLevelSummary } from 'app/service/firebase/firebase-gene-service';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import NestLevelSummary, { NestLevelSummaryStats } from './NestLevelSummary';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { getMutationStats } from 'app/shared/util/firebase/firebase-utils';
import { UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS } from 'app/config/constants/constants';
import { Unsubscribe } from 'firebase/auth';

export interface MutationLevelSummaryProps extends StoreProps {
  mutationPath: string;
  hideOncogenicity?: boolean;
}

const MutationLevelSummary = ({ mutationPath, firebaseDb, hideOncogenicity = false }: MutationLevelSummaryProps) => {
  const [mutationStatsInitialized, setMutationStatsInitialized] = useState(false);
  const [mutationStats, setMutationStats] = useState<NestLevelSummaryStats>();

  const updateMutationStats = useCallback((snapshot: DataSnapshot) => {
    const calcMutationStats = getMutationStats(snapshot.val());
    setMutationStats(calcMutationStats);
  }, []);

  const updateMutationStatsDebounced = _.debounce(updateMutationStats, UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS);

  useEffect(() => {
    if (!firebaseDb) {
      return;
    }
    const callbacks: Unsubscribe[] = [];
    callbacks.push(
      onValue(ref(firebaseDb, mutationPath), snapshot => {
        if (mutationStatsInitialized) {
          updateMutationStatsDebounced(snapshot);
        } else {
          updateMutationStats(snapshot);
          setMutationStatsInitialized(true);
        }
      }),
    );
    return () => callbacks.forEach(callback => callback?.());
  }, [mutationStatsInitialized]);
  return <>{mutationStats && <NestLevelSummary summaryStats={mutationStats} hideOncogenicity={hideOncogenicity} />}</>;
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(MutationLevelSummary));
