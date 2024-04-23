import React, { useMemo } from 'react';
import TimeSeries, { ExtraTimeSeriesEventData, RequiredTimeSeriesEventData } from '../timeSeries/TimeSeries';
import './gene-history.scss';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { FaHistory } from 'react-icons/fa';
import constructTimeSeriesData from './gene-history-tooltip-utils';
import { GREY } from 'app/config/colors';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';

export interface IGeneHistoryTooltipProps {
  historyData: Map<string, FlattenedHistory[]>;
  location?: string;
  groupByDay?: boolean;
}

function GeneHistoryTooltip({ location, historyData }: IGeneHistoryTooltipProps) {
  const parsedHistoryData = useMemo(() => {
    if (!historyData) {
      return [];
    }

    const parsedData: (RequiredTimeSeriesEventData | ExtraTimeSeriesEventData)[] = [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    for (const record of historyData.get(location) || []) {
      parsedData.push(constructTimeSeriesData(record));
    }
    return parsedData;
  }, [historyData, location]);

  return (
    <DefaultTooltip
      placement="top"
      overlayInnerStyle={{ maxWidth: '600px', width: 'fit-content', maxHeight: '400px', overflow: 'auto' }}
      overlay={<TimeSeries groupByDay={false} data={parsedHistoryData} />}
    >
      <FaHistory color={parsedHistoryData.length === 0 ? GREY : 'black'} />
    </DefaultTooltip>
  );
}

export default GeneHistoryTooltip;
