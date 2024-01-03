import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { AllLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import NestLevelSummary from './NestLevelSummary';

export interface CancerTypeLevelSummaryProps extends StoreProps {
  mutationUuid: string;
  cancerTypeUuid: string;
}

const CancerTypeLevelSummary = (props: CancerTypeLevelSummaryProps) => {
  const summaryStats = useMemo(() => {
    const stats = props.mutationSummaryStats[props.mutationUuid][props.cancerTypeUuid];
    const { TT, oncogenicity, ...rest } = stats;
    return {
      ...rest,
      txLevels: _.chain(stats.txLevels).countBy().value(),
      dxLevels: _.chain(stats.dxLevels).countBy().value(),
      pxLevels: _.chain(stats.pxLevels).countBy().value(),
    };
  }, [props.mutationSummaryStats, props.mutationUuid, props.cancerTypeUuid]);

  return <NestLevelSummary summaryStats={summaryStats} />;
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  mutationSummaryStats: firebaseGeneStore.allLevelMutationSummaryStats,
});

type StoreProps = {
  mutationSummaryStats?: AllLevelSummary;
};

export default componentInject(mapStoreToProps)(observer(CancerTypeLevelSummary));
