import { HistoryOperationType } from 'app/shared/model/firebase/firebase.model';
import { RequiredTimeSeriesEventData, ExtraTimeSeriesEventData } from '../timeSeries/TimeSeries';
import React from 'react';
import { getTxName } from 'app/shared/util/firebase/firebase-utils';
import { IDrug } from 'app/shared/model/drug.model';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';
import DiffViewer from 'app/components/diff-viewer/DiffViewer';
import { READABLE_FIELD } from 'app/config/constants/firebase';

export default function constructTimeSeriesData(record: FlattenedHistory): RequiredTimeSeriesEventData | ExtraTimeSeriesEventData {
  let operation: string;
  let bubbleColor: string;
  let content: React.ReactNode;

  switch (record.operation) {
    case HistoryOperationType.PROMOTE_VUS:
      operation = 'promotion to mutation';
      bubbleColor = 'green';
      content = <></>;
      break;
    case HistoryOperationType.ADD:
      operation = 'addition';
      bubbleColor = 'green';
      content = <></>;
      break;
    case HistoryOperationType.UPDATE:
      bubbleColor = 'orange';
      operation = 'update';
      content = getTimeSeriesDataContent(record.new as string, record.old as string);
      break;
    case HistoryOperationType.DEMOTE_MUTATION:
      bubbleColor = 'red';
      operation = 'demotion to VUS';
      content = <></>;
      break;
    case HistoryOperationType.DELETE:
      bubbleColor = 'red';
      operation = 'deletion';
      content = <></>;
      break;
    case HistoryOperationType.NAME_CHANGE:
      bubbleColor = 'orange';
      operation = 'name change';
      content = getTimeSeriesDataContent(record.new as string, record.old as string);
      break;
    default:
      operation = '';
      bubbleColor = 'blue';
  }

  if (!content) {
    return;
  }

  return {
    createdAt: new Date(record.timeStamp),
    admin: record.admin,
    editBy: record.lastEditBy,
    operation,
    bubbleColor,
    content,
    location: record.location,
  };
}

export function getTimeSeriesDataContent(newContent = '', oldContent = '') {
  return (
    <div className="gene-history-event-content">
      <DiffViewer new={newContent} old={oldContent} type={'merged'} />
    </div>
  );
}

export function formatLocation(location: string, drugList: IDrug[], objectField: string) {
  const locationSubstrings = location.split(',');
  const lastSubstring = locationSubstrings[locationSubstrings.length - 1];
  if (lastSubstring.endsWith('Mutation Effect')) {
    if (objectField === 'description') {
      return location + ', Description of Evidence';
    } else if (objectField === 'oncogenic') {
      return location + ', Oncogenic';
    } else if (objectField === 'pathogenic') {
      return location + ', Pathogenicity';
    }
  } else if (lastSubstring.endsWith('Tumor Type Summary')) {
    return locationSubstrings.slice(0, -1).join(',') + ', Therapeutic Summary';
  } else if (lastSubstring.endsWith('Cancer Risk')) {
    if (objectField === 'monoallelic') {
      return location + ', Monoallelic';
    } else if (objectField === 'biallelic') {
      return location + ', Biallelic';
    } else if (objectField === 'mosaic') {
      return location + ', Mosaic';
    } else if (objectField === 'carrier') {
      return location + ', Carrier';
    }
  } else if (lastSubstring.endsWith('Penetrance')) {
    if (objectField === 'penetrance') {
      return location + ', Penetrance';
    } else if (objectField === 'description') {
      return location + ', Description of Penetrance';
    }
  } else if (lastSubstring.endsWith('Inheritance Mechanism')) {
    if (objectField === 'inheritanceMechanism') {
      return location + ', Mechanism of Inheritance';
    } else if (objectField === 'description') {
      return location + ', Description of Inheritance Mechanism';
    }
  } else {
    let index = -1;
    for (let i = 0; i < locationSubstrings.length; i++) {
      if (
        locationSubstrings[i].includes('_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_') ||
        locationSubstrings[i].includes('implications for') ||
        locationSubstrings[i].includes('INVESTIGATIONAL_THERAPEUTIC_IMPLICATIONS_DRUG')
      ) {
        index = i;
        break;
      }
    }

    if (index > -1) {
      return locationSubstrings.slice(0, index) + ', ' + getTxName(drugList, locationSubstrings.slice(index + 1).join(','));
    }
  }
  return location;
}

export function getTooltipHistoryList(history: FlattenedHistory[]) {
  const tooltipHistoryList = new Map<string, FlattenedHistory[]>();
  for (const record of history) {
    let locationIdentifier: string;
    if (record.info) {
      const { mutation, cancerType, treatment, fields } = record.info;
      locationIdentifier = getLocationIdentifier({
        mutationUuid: mutation?.uuid,
        cancerTypesUuid: cancerType?.uuid,
        treatmentUuid: treatment?.uuid,
        fields,
      });
    } else {
      locationIdentifier = record.location;
    }

    if (!tooltipHistoryList.get(locationIdentifier)) {
      let prevRecords = tooltipHistoryList.get(record.location);
      if (prevRecords) {
        tooltipHistoryList.delete(record.location);
      } else {
        prevRecords = [];
      }

      tooltipHistoryList.set(locationIdentifier, [...prevRecords, record]);
    } else {
      tooltipHistoryList.get(locationIdentifier).push(record);
    }
  }
  return tooltipHistoryList;
}

const LOCATION_IDENTIFIER_DEFAULT_VALUE = '$';
export function getLocationIdentifier({
  mutationUuid = LOCATION_IDENTIFIER_DEFAULT_VALUE,
  cancerTypesUuid = LOCATION_IDENTIFIER_DEFAULT_VALUE,
  treatmentUuid = LOCATION_IDENTIFIER_DEFAULT_VALUE,
  fields = [] as READABLE_FIELD[],
}) {
  return `${mutationUuid}_${cancerTypesUuid}_${treatmentUuid}_${fields.join('_')}`;
}
