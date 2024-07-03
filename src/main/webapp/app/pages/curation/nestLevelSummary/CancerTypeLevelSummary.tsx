import { getCancerTypeStats } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import NestLevelSummary from './NestLevelSummary';
import { UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS } from 'app/config/constants/constants';

export interface CancerTypeLevelSummaryProps extends StoreProps {
  cancerTypePath: string;
}

const CancerTypeLevelSummary = ({ cancerTypePath, firebaseDb }: CancerTypeLevelSummaryProps) => {
  const [cancerTypeStatsInitialized, setCancerTypeStatsInitialized] = useState(false);
  const [cancerTypeStats, setCancerTypeStats] = useState(undefined);

  const updateCancerTypeStats = useCallback((snapshot: DataSnapshot) => {
    const calcCancerTypeStats = getCancerTypeStats(snapshot.val());
    setCancerTypeStats(calcCancerTypeStats);
  }, []);

  const updateCancerTypeStatsDebounced = _.debounce(updateCancerTypeStats, UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, cancerTypePath), snapshot => {
        if (cancerTypeStatsInitialized) {
          updateCancerTypeStatsDebounced(snapshot);
        } else {
          updateCancerTypeStats(snapshot);
          setCancerTypeStatsInitialized(true);
        }
      })
    );
    return () => callbacks.forEach(callback => callback?.());
  }, [cancerTypeStatsInitialized]);

  if (!cancerTypeStats) {
    return <></>;
  }

  return <NestLevelSummary summaryStats={cancerTypeStats} />;
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerTypeLevelSummary));
