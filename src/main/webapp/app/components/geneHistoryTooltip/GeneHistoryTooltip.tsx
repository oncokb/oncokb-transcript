import React, { useMemo } from 'react';
import TimeSeries, { ExtraTimeSeriesEventData, RequiredTimeSeriesEventData } from '../timeSeries/TimeSeries';
import './gene-history.scss';
import { CANCER_TYPE_THERAPY_INDENTIFIER } from 'app/config/constants/constants';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import { FaHistory } from 'react-icons/fa';
import { ParsedHistoryRecord } from 'app/pages/curation/CurationPage';
import constructTimeSeriesData from './gene-history-tooltip-utils';
import { GREY } from 'app/config/colors';

export interface IGeneHistoryTooltipProps {
  historyData: Map<string, ParsedHistoryRecord[]>;
  location?: string;
  groupByDay?: boolean;
  contentFieldWhenObject?: string;
}

function GeneHistoryTooltip({ location, historyData, contentFieldWhenObject = 'description' }: IGeneHistoryTooltipProps) {
  const parsedHistoryData = useMemo(() => {
    if (!historyData) {
      return [];
    }

    const parsedData: (RequiredTimeSeriesEventData | ExtraTimeSeriesEventData)[] = [];
    for (const [recordLocation, records] of historyData) {
      if (!location || recordLocation === location) {
        addTimeSeriesDataForParsedRecords(records, parsedData);
      } else if (location.startsWith(CANCER_TYPE_THERAPY_INDENTIFIER)) {
        const parsedLocation = location.slice(CANCER_TYPE_THERAPY_INDENTIFIER.length);

        const recordLocationSubstrings = recordLocation.split(',');
        const parsedRecordLocationSubstrings = [];
        for (const substr of recordLocationSubstrings) {
          if (!substr.includes('_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_') && !substr.includes('implications for')) {
            parsedRecordLocationSubstrings.push(substr);
          }
        }
        const parsedRecordLocation = parsedRecordLocationSubstrings.join(',');

        if (parsedRecordLocation === parsedLocation) {
          addTimeSeriesDataForParsedRecords(records, parsedData);
        }
      }
    }
    return parsedData;
  }, [historyData, location]);

  function addTimeSeriesDataForParsedRecords(
    parsedRecords: ParsedHistoryRecord[],
    parsedData: (RequiredTimeSeriesEventData | ExtraTimeSeriesEventData)[]
  ) {
    for (const parsedRecord of parsedRecords) {
      const timeSeriesData = constructTimeSeriesData(
        parsedRecord.record,
        parsedRecord.admin,
        parsedRecord.timestamp,
        contentFieldWhenObject
      );
      if (timeSeriesData) {
        parsedData.push(timeSeriesData);
      }
    }
  }

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
