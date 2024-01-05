import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { AllLevelSummary, MutationLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React, { useMemo } from 'react';
import NestLevelSummary from './NestLevelSummary';
import { ONCOGENICITY } from 'app/config/constants/constants';

export interface MutationLevelSummaryProps extends StoreProps {
  mutationUuid: string;
}

const MutationLevelSummary = (props: MutationLevelSummaryProps) => {
  const mutationLevelSummary = props.mutationSummaryStats[props.mutationUuid];
  return <NestLevelSummary summaryStats={mutationLevelSummary} />;
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  mutationSummaryStats: firebaseGeneStore.mutationLevelMutationSummaryStats,
});

type StoreProps = {
  mutationSummaryStats?: MutationLevelSummary;
};

export default componentInject(mapStoreToProps)(observer(MutationLevelSummary));
