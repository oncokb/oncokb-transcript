import { FIREBASE_ONCOGENICITY_MAPPING, ONCOGENICITY_CLASS_MAPPING } from 'app/config/constants/firebase';
import CountBadge from 'app/shared/badge/CountBadge';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';

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
  if (props.summaryStats) {
    return (
      <div className="ml-auto d-flex flex-wrap">
        {Object.keys(props.summaryStats)
          .filter(k => props.summaryStats[k] && props.summaryStats[k] > 0)
          .map(k => {
            return <CountBadge count={props.summaryStats[k]} base={k} key={`summaries-${k}`} />;
          })}
        {Object.keys(props.summaryStats.txLevels).map(k => {
          return (
            <CountBadge
              count={props.summaryStats.txLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`tx-levels-${k}`}
            />
          );
        })}
        {Object.keys(props.summaryStats.dxLevels).map(k => {
          return (
            <CountBadge
              count={props.summaryStats.dxLevels[k]}
              base={<span className={classNames('oncokb', 'icon', `level-${k}`)}></span>}
              key={`dx-levels-${k}`}
            />
          );
        })}
        {Object.keys(props.summaryStats.pxLevels).map(k => {
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
      </div>
    );
  }
  return <div></div>;
};

export default NestLevelSummary;
