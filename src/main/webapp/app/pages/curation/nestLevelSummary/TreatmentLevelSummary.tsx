import { getTreatmentStats } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useState } from 'react';
import NestLevelSummary from './NestLevelSummary';
import './nest-level-summary.scss';
import _ from 'lodash';
import { UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS } from 'app/config/constants/constants';

export interface TreatmentLevelSummaryProps extends StoreProps {
  treatmentPath: string;
}

const TreatmentLevelSummary = ({ firebaseDb, treatmentPath }: TreatmentLevelSummaryProps) => {
  const [treatmentStatsInitialized, setTreatmentStatsInitialized] = useState(false);
  const [treatmentStats, setTreatmentStats] = useState(undefined);

  const updateTreatmentStats = (snapshot: DataSnapshot) => {
    const calcTreatmentStats = getTreatmentStats(snapshot.val());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTreatmentStats(calcTreatmentStats);
  };

  const updateTreatmentStatsDebounced = _.debounce(updateTreatmentStats, UPDATE_SUMMARY_STATS_DEBOUNCE_MILLISECONDS);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onValue(ref(firebaseDb, treatmentPath), snapshot => {
        if (treatmentStatsInitialized) {
          updateTreatmentStatsDebounced(snapshot);
        } else {
          updateTreatmentStats(snapshot);
          setTreatmentStatsInitialized(true);
        }
      })
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return () => callbacks.forEach(callback => callback?.());
  }, [treatmentStatsInitialized]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <NestLevelSummary isTreatmentStats summaryStats={treatmentStats} />;
};

const mapStoreToProps = ({ firebaseAppStore }: IRootStore) => ({
  firebaseDb: firebaseAppStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TreatmentLevelSummary));
