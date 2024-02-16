import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import { MutationLevelSummary } from 'app/stores/firebase/firebase.gene.store';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import NestLevelSummary from './NestLevelSummary';

export interface MutationLevelSummaryProps extends StoreProps {
  mutationUuid: string;
  hideOncogenicity?: boolean;
}

const MutationLevelSummary = ({ mutationSummaryStats, mutationUuid, hideOncogenicity = false }: MutationLevelSummaryProps) => {
  const mutationLevelSummary = mutationSummaryStats[mutationUuid];
  return <NestLevelSummary summaryStats={mutationLevelSummary} hideOncogenicity={hideOncogenicity} />;
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  mutationSummaryStats: firebaseGeneStore.mutationLevelMutationSummaryStats,
});

type StoreProps = {
  mutationSummaryStats?: MutationLevelSummary;
};

export default componentInject(mapStoreToProps)(observer(MutationLevelSummary));
