import 'jest-expect-message';
import constructTimeSeriesData, { getTimeSeriesDataContent } from './gene-history-tooltip-utils';
import { HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import React from 'react';

const USER_NAME = 'Test User 1';
const TIMESTAMP = '518022762874';

describe('GeneHistoryTooltipUtils', () => {
  describe('getTimeSeriesDataContent', () => {
    it('should create non-emtpy time series data content with string new content', () => {
      const objectField = 'description';
      const newContent = 'test';
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(objectField, newContent, oldContent);
      expect(timeSeriesDataContent).not.toEqual(<></>);
    });

    it('should create non-emtpy time series data content with valid object new content', () => {
      const objectField = 'description';
      const newContent = {
        description: 'test',
      };
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(objectField, newContent as any, oldContent); // history collection does not align with model so necessary cast
      expect(timeSeriesDataContent).not.toEqual(<></>);
    });

    it('should create undefined time series data content with invalid object new content', () => {
      const objectField = 'content';
      const newContent = {
        description: 'test',
      };
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(objectField, newContent as any, oldContent); // history collection does not align with model so necessary cast
      expect(timeSeriesDataContent).toBeUndefined();
    });
  });

  describe('constructTimeSeriesData', () => {
    it('should create time series data with add operation', () => {
      const record: HistoryRecord = {
        lastEditBy: USER_NAME,
        location: '',
        new: 'Test',
        old: '',
        operation: 'add',
        uuids: '',
      };
      const timestamp = '518022762874';
      const objectField = 'description';

      const timeSeriesData = constructTimeSeriesData(record, timestamp, objectField);
      expect(timeSeriesData.operation, 'operation should be "added"').toEqual('added');
      expect(timeSeriesData.bubbleColor, 'bubble color should be "green"').toEqual('green');
      expect(timeSeriesData.content, 'content should be non empty').not.toEqual(<></>);
    });

    it('should create time series data with update operation', () => {
      const record: HistoryRecord = {
        lastEditBy: USER_NAME,
        location: '',
        new: 'Test',
        old: '',
        operation: 'update',
        uuids: '',
      };
      const timestamp = '518022762874';
      const objectField = 'description';

      const timeSeriesData = constructTimeSeriesData(record, timestamp, objectField);
      expect(timeSeriesData.operation, 'operation should be "updated"').toEqual('updated');
      expect(timeSeriesData.bubbleColor, 'bubble color should be "orange"').toEqual('orange');
      expect(timeSeriesData.content, 'content should be non empty').not.toEqual(<></>);
    });

    it('should create time series data with delete operation', () => {
      const record: HistoryRecord = {
        lastEditBy: USER_NAME,
        location: '',
        new: null,
        old: null,
        operation: 'delete',
        uuids: '',
      };
      const timestamp = '518022762874';
      const objectField = 'description';

      expect(JSON.stringify(constructTimeSeriesData(record, timestamp, objectField))).toEqual(
        JSON.stringify({
          createdAt: new Date(timestamp),
          editBy: USER_NAME,
          operation: 'deleted',
          bubbleColor: 'red',
          content: <></>,
        })
      );
    });

    it('should create time series data with name_change operation', () => {});

    it('should return undefined for invalid operation', () => {
      const record: HistoryRecord = {
        lastEditBy: USER_NAME,
        location: '',
        new: null,
        old: null,
        operation: 'invalid',
        uuids: '',
      };
      const timestamp = TIMESTAMP;
      const objectField = 'description';

      expect(constructTimeSeriesData(record, timestamp, objectField)).toBeUndefined();
    });
  });
});
