import { FIREBASE_ONCOGENICITY_MAPPING, ONCOGENICITY_CLASS_MAPPING } from 'app/config/constants/firebase';
import CountBadge from 'app/shared/badge/CountBadge';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';
import { sortByDxLevel, sortByPxLevel, sortByTxLevel } from 'app/shared/util/firebase/firebase-utils';
import './nest-level-summary.scss';
import '../../../shared/badge/count-badge.scss';
import { DX_LEVELS, PX_LEVELS, TX_LEVELS } from 'app/shared/model/firebase/firebase.model';
import { OncoKBIcon } from 'app/shared/icons/OncoKBIcon';

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
const hiddenCountSummaryKeys: (keyof NestLevelSummaryStats)[] = ['TTS', 'DxS', 'PxS'];
const levelSummaryKeys: (keyof NestLevelSummaryStats)[] = ['dxLevels', 'pxLevels', 'txLevels'];

const READABLE_SUMMARY_KEY: { [key in keyof NestLevelSummaryStats]: string } = {
  TT: 'tumor type(s)',
  TTS: 'Tx summary',
  DxS: 'Dx summary',
  PxS: 'Px summary',
  dxLevels: 'Dx level',
  pxLevels: 'Px level',
  txLevels: 'Level',
};

export interface NestLevelSummaryProps {
  summaryStats: NestLevelSummaryStats;
  hideOncogenicity?: boolean;
  isTreatmentStats?: boolean;
}

function getTooltipText(key: keyof NestLevelSummaryStats, count: number, level?: DX_LEVELS | PX_LEVELS | TX_LEVELS) {
  if (hiddenCountSummaryKeys.includes(key)) {
    return `${READABLE_SUMMARY_KEY[key]} available`;
  }
  if (levelSummaryKeys.includes(key)) {
    return `${count} ${READABLE_SUMMARY_KEY[key]} ${level.replace(/\D/g, '')} curated`;
  }
  return `${count} ${READABLE_SUMMARY_KEY[key]} curated`;
}

export const NestLevelSummary = ({ summaryStats, hideOncogenicity, isTreatmentStats }: NestLevelSummaryProps) => {
  let lastBadgeHasHiddenNumber = false;

  const badges = summaryStats ? (
    <>
      {(Object.keys(summaryStats) as (keyof NestLevelSummaryStats)[])
        .filter(k => summaryStats[k] && summaryStats[k] > 0)
        .map(k => {
          const hideWhenOne = hiddenCountSummaryKeys.includes(k);
          if (hideWhenOne) {
            lastBadgeHasHiddenNumber = true;
          }
          return (
            <CountBadge
              count={summaryStats[k]}
              base={
                <DefaultTooltip placement="top" overlay={<span>{getTooltipText(k, summaryStats[k])}</span>}>
                  <span>{k}</span>
                </DefaultTooltip>
              }
              key={`summaries-${k}`}
              hideWhenOne={hideWhenOne}
            />
          );
        })}
      {(Object.keys(summaryStats.txLevels) as TX_LEVELS[])
        .filter(k => k !== TX_LEVELS.LEVEL_NO)
        .sort(sortByTxLevel)
        .map(k => {
          lastBadgeHasHiddenNumber = false;
          return (
            <CountBadge
              count={summaryStats.txLevels[k]}
              base={
                <DefaultTooltip placement="top" overlay={<span>{getTooltipText('txLevels', summaryStats.txLevels[k], k)}</span>}>
                  <div>
                    <OncoKBIcon iconType="level" value={k} />
                  </div>
                </DefaultTooltip>
              }
              key={`tx-levels-${k}`}
              hideWhenOne={isTreatmentStats}
            />
          );
        })}
      {(Object.keys(summaryStats.dxLevels) as DX_LEVELS[]).sort(sortByDxLevel).map(k => {
        lastBadgeHasHiddenNumber = false;
        return (
          <CountBadge
            count={summaryStats.dxLevels[k]}
            base={
              <DefaultTooltip placement="top" overlay={<span>{getTooltipText('dxLevels', summaryStats.dxLevels[k], k)}</span>}>
                <div>
                  <OncoKBIcon iconType="level" value={k} />
                </div>
              </DefaultTooltip>
            }
            key={`dx-levels-${k}`}
          />
        );
      })}
      {(Object.keys(summaryStats.pxLevels) as PX_LEVELS[]).sort(sortByPxLevel).map(k => {
        lastBadgeHasHiddenNumber = false;
        return (
          <CountBadge
            count={summaryStats.pxLevels[k]}
            base={
              <DefaultTooltip placement="top" overlay={<span>{getTooltipText('pxLevels', summaryStats.pxLevels[k], k)}</span>}>
                <div>
                  <OncoKBIcon iconType="level" value={k} />
                </div>
              </DefaultTooltip>
            }
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
              <div>
                <OncoKBIcon iconType="oncogenicity" value={ONCOGENICITY_CLASS_MAPPING[summaryStats.oncogenicity]} />
              </div>
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
