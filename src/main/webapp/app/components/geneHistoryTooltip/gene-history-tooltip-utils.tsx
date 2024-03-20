import { HistoryRecord, HistoryRecordState } from 'app/shared/model/firebase/firebase.model';
import { RequiredTimeSeriesEventData, ExtraTimeSeriesEventData } from '../timeSeries/TimeSeries';
import ReactDiffViewer from 'react-diff-viewer-continued';
import React from 'react';
import { getTxName } from 'app/shared/util/firebase/firebase-utils';
import { IDrug } from 'app/shared/model/drug.model';

export default function constructTimeSeriesData(
  record: HistoryRecord,
  admin: string,
  timestamp: number,
  objectField: string
): RequiredTimeSeriesEventData | ExtraTimeSeriesEventData {
  let operation: string;
  let bubbleColor: string;
  let content: React.ReactNode;

  switch (record.operation) {
    case 'add':
      operation = 'addition';
      bubbleColor = 'green';
      content = getTimeSeriesDataContent(objectField, record.new, record.old);
      break;
    case 'update':
      bubbleColor = 'orange';
      operation = 'update';
      content = getTimeSeriesDataContent(objectField, record.new, record.old);
      break;
    case 'delete':
      bubbleColor = 'red';
      operation = 'deletion';
      content = <></>;
      break;
    case 'name change':
      bubbleColor = 'orange';
      operation = 'name change';
      content = getTimeSeriesDataContent(objectField, record.new, record.old);
      break;
    default:
      operation = '';
      bubbleColor = 'blue';
  }

  if (!content) {
    return;
  }

  return {
    createdAt: new Date(timestamp),
    admin,
    editBy: record.lastEditBy,
    operation,
    bubbleColor,
    content,
    location: record.location,
    objectField,
  };
}

export function getTimeSeriesDataContent(objectField: string, newContent: HistoryRecordState, oldContent?: HistoryRecordState) {
  let body: React.ReactNode;

  try {
    switch (typeof newContent) {
      case 'string':
        body = (
          <div>
            <div className="gene-history-event-content">
              <ReactDiffViewer showDiffOnly={false} oldValue={oldContent} newValue={newContent} splitView={false} hideLineNumbers />
            </div>
          </div>
        );
        break;
      case 'object': // only if data is poorly formatted
        if (!newContent[objectField]) {
          return undefined;
        }

        body = (
          <div>
            <div className="gene-history-event-content">
              <ReactDiffViewer
                showDiffOnly={false}
                oldValue={oldContent?.[objectField]}
                newValue={newContent[objectField]}
                splitView={false}
                hideLineNumbers
              />
            </div>
          </div>
        );
        break;
      default:
        return undefined;
    }
  } catch {
    body = <h6 className="gene-history-event-content gene-history-error-content">Record formatted incorrectly</h6>;
  }

  return <div>{body}</div>;
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
