import { getTreatmentStats } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import NestLevelSummary from './NestLevelSummary';
import './nest-level-summary.scss';

export interface TreatmentLevelSummaryProps extends StoreProps {
  treatmentPath: string;
}

const TreatmentLevelSummary = ({ firebaseDb, treatmentPath }: TreatmentLevelSummaryProps) => {
  const [treatmentStats, setTreatmentStats] = useState(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, treatmentPath), snapshot => {
        const calcTreatmentStats = getTreatmentStats(snapshot.val());
        setTreatmentStats(calcTreatmentStats);
      })
    );
    return () => callbacks.forEach(callback => callback?.());
  }, []);

  return <NestLevelSummary isTreatmentStats summaryStats={treatmentStats} />;
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TreatmentLevelSummary));
