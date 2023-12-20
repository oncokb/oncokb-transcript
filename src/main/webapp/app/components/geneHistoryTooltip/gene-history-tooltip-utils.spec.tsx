import 'jest-expect-message';
import constructTimeSeriesData, { getTimeSeriesDataContent } from './gene-history-tooltip-utils';
import { HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import React from 'react';

describe('GeneHistoryTooltipUtils', () => {
  describe('getTimeSeriesDataContent', () => {
    it('should create non-empty time series data content with string new content', () => {
      const objectField = 'description';
      const newContent = 'test';
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(objectField, newContent, oldContent);
      expect(timeSeriesDataContent).not.toEqual(<></>);
    });

    it('should create non-empty time series data content with valid object new content', () => {
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
    const USER_NAME = 'Test User 1';
    const ADMIN = 'Test Admin 1';
    const TIMESTAMP = '518022762874';
    const OBJECT_FIELD = 'description';

    it('should create time series data with add operation', () => {
      const record: HistoryRecord = {
        lastEditBy: USER_NAME,
        location: '',
        new: 'Test',
        old: '',
        operation: 'add',
        uuids: '',
      };

      const timeSeriesData = constructTimeSeriesData(record, ADMIN, TIMESTAMP, OBJECT_FIELD);
      expect(timeSeriesData.operation, 'operation should be "added"').toEqual('addition');
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

      const timeSeriesData = constructTimeSeriesData(record, ADMIN, TIMESTAMP, OBJECT_FIELD);
      expect(timeSeriesData.operation, 'operation should be "updated"').toEqual('update');
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

      expect(JSON.stringify(constructTimeSeriesData(record, ADMIN, TIMESTAMP, OBJECT_FIELD))).toEqual(
        JSON.stringify({
          createdAt: new Date(TIMESTAMP),
          admin: ADMIN,
          editBy: USER_NAME,
          operation: 'deletion',
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

      expect(constructTimeSeriesData(record, ADMIN, TIMESTAMP, OBJECT_FIELD)).toBeUndefined();
    });
  });
});
