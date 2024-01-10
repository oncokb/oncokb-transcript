import { componentInject } from 'app/shared/util/typed-inject';
import { IRootStore } from 'app/stores';
import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import classNames from 'classnames';
import './nest-level-summary.scss';
import { sortByTxLevel } from 'app/shared/util/firebase/firebase-utils';
import NestLevelSummary from './NestLevelSummary';

export interface TreatmentLevelSummaryProps extends StoreProps {
  mutationUuid: string;
  cancerTypesUuid: string;
  treatmentUuid: string;
}

const TreatmentLevelSummary = (props: TreatmentLevelSummaryProps) => {
  const treatmentLevelSummary = props.allLevelSummaryStats[props.mutationUuid][props.cancerTypesUuid].treatmentSummary[props.treatmentUuid];
  return (
    <NestLevelSummary
      isTreatmentStats
      summaryStats={{
        TTS: 0,
        DxS: 0,
        PxS: 0,
        txLevels: treatmentLevelSummary.reduce((obj, level) => {
          obj[level] = 1;
          return obj;
        }, {}),
        dxLevels: [],
        pxLevels: [],
      }}
    />
  );
};

const mapStoreToProps = ({ firebaseGeneStore }: IRootStore) => ({
  allLevelSummaryStats: firebaseGeneStore.allLevelMutationSummaryStats,
});

type StoreProps = Partial<ReturnType<typeof mapStoreToProps>>;

export default componentInject(mapStoreToProps)(observer(TreatmentLevelSummary));
