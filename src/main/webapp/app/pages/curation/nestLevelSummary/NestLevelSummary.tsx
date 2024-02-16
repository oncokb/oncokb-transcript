import { FIREBASE_ONCOGENICITY_MAPPING, ONCOGENICITY_CLASS_MAPPING } from 'app/config/constants/firebase';
import CountBadge from 'app/shared/badge/CountBadge';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';
import { sortByTxLevel } from 'app/shared/util/firebase/firebase-utils';
import './nest-level-summary.scss';
import '../../../shared/badge/count-badge.scss';
import { TX_LEVELS } from 'app/shared/model/firebase/firebase.model';

export type NestLevelSummaryStats = {
  TT?: number;
  oncogenicity?: string;
  TTS: number;
  DxS: number;
  PxS: number;
  txLevels: any;
  dxLevels: any;
  pxLevels: any;
};

export interface NestLevelSummaryProps {
  summaryStats: NestLevelSummaryStats;
  hideOncogenicity?: boolean;
  isTreatmentStats?: boolean;
}

export const NestLevelSummary = ({ summaryStats, hideOncogenicity, isTreatmentStats }: NestLevelSummaryProps) => {
  const summaryKeys: (keyof NestLevelSummaryStats)[] = ['TTS', 'DxS', 'PxS'];

  let lastBadgeHasHiddenNumber = false;

  const badges = summaryStats ? (
    <>
      {Object.keys(summaryStats)
        .filter(k => summaryStats[k] && summaryStats[k] > 0)
        .map(k => {
          const hideWhenOne = summaryKeys.includes(k as keyof NestLevelSummaryStats);
          if (hideWhenOne) {
            lastBadgeHasHiddenNumber = true;
          }
          return (
            <CountBadge
              count={summaryStats[k]}
              base={k}
              key={`summaries-${k}`}
              hideWhenOne={summaryKeys.includes(k as keyof NestLevelSummaryStats)}
            />
          );
        })}
      {Object.keys(summaryStats.txLevels)
        .filter(k => k !== TX_LEVELS.LEVEL_NO)
        .sort(sortByTxLevel)
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return isTreatmentStats ? (
            <div key={`tx-levels-${k}`} className="count-badge-wrapper all-children-margin">
              <span className={classNames('oncokb', 'icon', `level-${k}`)}></span>
            </div>
          ) : (
            <CountBadge
              count={summaryStats.txLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`tx-levels-${k}`}
            />
          );
        })}
      {Object.keys(summaryStats.dxLevels)
        .sort()
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={summaryStats.dxLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`dx-levels-${k}`}
            />
          );
        })}
      {Object.keys(summaryStats.pxLevels)
        .sort()
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={summaryStats.pxLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`px-levels-${k}`}
            />
          );
        })}
      {!hideOncogenicity && summaryStats.oncogenicity ? (
        <CountBadge
          hideWhenOne
          count={1}
          base={
            <DefaultTooltip placement="top" overlay={<span>{FIREBASE_ONCOGENICITY_MAPPING[summaryStats.oncogenicity]}</span>}>
              <span className={classNames('oncokb', 'icon', `${ONCOGENICITY_CLASS_MAPPING[summaryStats.oncogenicity]}`)}></span>
            </DefaultTooltip>
          }
        />
      ) : undefined}
    </>
  ) : (
    <></>
  );

  if (summaryStats?.oncogenicity) {
    lastBadgeHasHiddenNumber = true;
  }

  if (summaryStats) {
    return <div className={classNames('d-flex align-items-center all-children-margin')}>{badges}</div>;
  }
  return <div></div>;
};

export default NestLevelSummary;
