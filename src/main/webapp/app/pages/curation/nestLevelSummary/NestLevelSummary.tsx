import { FIREBASE_ONCOGENICITY_MAPPING, ONCOGENICITY_CLASS_MAPPING } from 'app/config/constants/firebase';
import CountBadge from 'app/shared/badge/CountBadge';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import _ from 'lodash';
import './nest-level-summary.scss';
import React from 'react';
import { sortByTxLevel } from 'app/shared/util/firebase/firebase-utils';

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
}

export const NestLevelSummary = (props: NestLevelSummaryProps) => {
  const summaryKeys: (keyof NestLevelSummaryStats)[] = ['TTS', 'DxS', 'PxS'];

  let lastBadgeHasHiddenNumber = false;

  const badges = props.summaryStats ? (
    <>
      {Object.keys(props.summaryStats)
        .filter(k => props.summaryStats[k] && props.summaryStats[k] > 0)
        .map(k => {
          const hideWhenOne = summaryKeys.includes(k as keyof NestLevelSummaryStats);
          if (hideWhenOne) {
            lastBadgeHasHiddenNumber = true;
          }
          return (
            <CountBadge
              count={props.summaryStats[k]}
              base={k}
              key={`summaries-${k}`}
              hideWhenOne={summaryKeys.includes(k as keyof NestLevelSummaryStats)}
            />
          );
        })}
      {Object.keys(props.summaryStats.txLevels)
        .sort(sortByTxLevel)
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={props.summaryStats.txLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`tx-levels-${k}`}
            />
          );
        })}
      {Object.keys(props.summaryStats.dxLevels)
        .sort()
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={props.summaryStats.dxLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`dx-levels-${k}`}
            />
          );
        })}
      {Object.keys(props.summaryStats.pxLevels)
        .sort()
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={props.summaryStats.pxLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`px-levels-${k}`}
            />
          );
        })}
      {props.summaryStats.oncogenicity ? (
        <CountBadge
          hideWhenOne
          count={1}
          base={
            <DefaultTooltip placement="top" overlay={<span>{FIREBASE_ONCOGENICITY_MAPPING[props.summaryStats.oncogenicity]}</span>}>
              <span className={classNames('oncokb', 'icon', `${ONCOGENICITY_CLASS_MAPPING[props.summaryStats.oncogenicity]}`)}></span>
            </DefaultTooltip>
          }
        />
      ) : undefined}
    </>
  ) : (
    <></>
  );

  if (props.summaryStats?.oncogenicity) {
    lastBadgeHasHiddenNumber = true;
  }

  const wrapperMarginRight = lastBadgeHasHiddenNumber ? undefined : 'mr-2';

  if (props.summaryStats) {
    return <div className={classNames('d-flex align-items-center', wrapperMarginRight)}>{badges}</div>;
  }
  return <div></div>;
};

export default NestLevelSummary;
