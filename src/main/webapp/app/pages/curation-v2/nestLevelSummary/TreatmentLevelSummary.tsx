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
  //   const treatmentLevelSummary = props.allLevelSummaryStats[props.mutationUuid][props.cancerTypesUuid].treatmentSummary[props.treatmentUuid];

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
  return (
    <NestLevelSummary
      isTreatmentStats
      summaryStats={{
        TTS: 0,
        DxS: 0,
        PxS: 0,
        txLevels: [],
        // txLevels: treatmentLevelSummary.reduce((obj, level) => {
        //   obj[level] = 1;
        //   return obj;
        // }, {}),
        dxLevels: [],
        pxLevels: [],
      }}
    />
  );
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TreatmentLevelSummary));
