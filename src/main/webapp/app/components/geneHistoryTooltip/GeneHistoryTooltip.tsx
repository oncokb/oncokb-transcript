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
  location: string; // location using names
  locationIdentifier: string; // location using uuids
  groupByDay?: boolean;
}

function GeneHistoryTooltip({ location, locationIdentifier, historyData }: IGeneHistoryTooltipProps) {
  const parsedHistoryData = useMemo(() => {
    if (!historyData) {
      return [];
    }

    const parsedData: (RequiredTimeSeriesEventData | ExtraTimeSeriesEventData)[] = [];

    const locationRecords = historyData.get(location) || [];
    const locationIdentifierRecords = historyData.get(locationIdentifier) || [];

    for (const record of [...locationRecords, ...locationIdentifierRecords]) {
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
