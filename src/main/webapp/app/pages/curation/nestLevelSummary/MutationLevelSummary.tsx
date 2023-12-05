import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { AllLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import NestLevelSummary from './NestLevelSummary';
import { ONCOGENICITY } from 'app/config/constants/constants';

export interface MutationLevelSummaryProps extends StoreProps {
  mutationUuid: string;
}

const MutationLevelSummary = (props: MutationLevelSummaryProps) => {
  const summaryStats = props.mutationSummaryStats[props.mutationUuid];

  const mutationLevelSummary = useMemo(() => {
    if (summaryStats) {
      const cancerTypeLevelSummaries = Object.keys(summaryStats).map(mutation => summaryStats[mutation]);
      const mutLevelSummary = {
        oncogenicity: cancerTypeLevelSummaries[0]?.oncogenicity || ONCOGENICITY.UNKNOWN,
        TT: _.sumBy(cancerTypeLevelSummaries, 'TT'),
        TTS: _.sumBy(cancerTypeLevelSummaries, 'TTS'),
        DxS: _.sumBy(cancerTypeLevelSummaries, 'DxS'),
        PxS: _.sumBy(cancerTypeLevelSummaries, 'PxS'),
        txLevels: _.chain(_.flatten(cancerTypeLevelSummaries.map(t => t.txLevels)))
          .countBy()
          .value(),
        dxLevels: _.chain(_.flatten(cancerTypeLevelSummaries.map(t => t.dxLevels)))
          .countBy()
          .value(),
        pxLevels: _.chain(_.flatten(cancerTypeLevelSummaries.map(t => t.pxLevels)))
          .countBy()
          .value(),
      };
      return mutLevelSummary;
    }
  }, [summaryStats]);

  return <NestLevelSummary summaryStats={mutationLevelSummary} />;
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  mutationSummaryStats: firebaseGeneStore.mutationSummaryStats,
});

type StoreProps = {
  mutationSummaryStats?: AllLevelSummary;
};

export default componentInject(mapStoreToProps)(observer(MutationLevelSummary));
