import { HistoryRecord, HistoryRecordState } from 'app/shared/model/firebase/firebase.model';
import { RequiredTimeSeriesEventData, ExtraTimeSeriesEventData } from '../timeSeries/TimeSeries';
import ReactDiffViewer from 'react-diff-viewer-continued';
import React from 'react';

export default function constructTimeSeriesData(
  record: HistoryRecord,
  timestamp: string,
  objectField: string
): RequiredTimeSeriesEventData | ExtraTimeSeriesEventData {
  let operation: string;
  let bubbleColor: string;
  let content: React.ReactNode;

  switch (record.operation) {
    case 'add':
      operation = 'added';
      bubbleColor = 'green';
      content = getTimeSeriesDataContent(objectField, record.new, record.old);
      break;
    case 'update':
      bubbleColor = 'orange';
      operation = 'updated';
      content = getTimeSeriesDataContent(objectField, record.new, record.old);
      break;
    case 'delete':
      bubbleColor = 'red';
      operation = 'deleted';
      content = <></>;
      break;
    case 'name change':
      bubbleColor = 'orange';
      operation = 'changed name';
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
    editBy: record.lastEditBy,
    operation,
    bubbleColor,
    content,
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
              <ReactDiffViewer oldValue={oldContent} newValue={newContent} splitView={false} hideLineNumbers />
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
              <ReactDiffViewer oldValue={oldContent?.[objectField]} newValue={newContent[objectField]} splitView={false} hideLineNumbers />
            </div>
          </div>
        );
        break;
      default:
        body = <h6 className="gene-history-event-content gene-history-error-content">Record missing data</h6>;
    }
  } catch {
    body = <h6 className="gene-history-event-content gene-history-error-content">Record formatted incorrectly</h6>;
  }

  return <div>{body}</div>;
}
