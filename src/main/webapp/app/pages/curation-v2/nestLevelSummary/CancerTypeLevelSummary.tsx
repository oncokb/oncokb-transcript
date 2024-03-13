import { getCancerTypeStats } from 'app/shared/util/firebase/firebase-utils';
import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { onValue, ref } from 'firebase/database';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useEffect, useMemo, useState } from 'react';
import NestLevelSummary from './NestLevelSummary';

export interface CancerTypeLevelSummaryProps extends StoreProps {
  cancerTypePath: string;
}

const CancerTypeLevelSummary = ({ cancerTypePath, firebaseDb }: CancerTypeLevelSummaryProps) => {
  const [cancerTypeStats, setCancerTypeStats] = useState(undefined);

  useEffect(() => {
    const callbacks = [];
    callbacks.push(
      onValue(ref(firebaseDb, cancerTypePath), snapshot => {
        const calcCancerTypeStats = getCancerTypeStats(snapshot.val());
        setCancerTypeStats(calcCancerTypeStats);
      })
    );
    return () => callbacks.forEach(callback => callback?.());
  }, []);

  if (!cancerTypeStats) {
    return <></>;
  }

  return <NestLevelSummary summaryStats={cancerTypeStats} />;
};

const mapStoreToProps = ({ firebaseStore }: IRootStore) => ({
  firebaseDb: firebaseStore.firebaseDb,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(CancerTypeLevelSummary));
