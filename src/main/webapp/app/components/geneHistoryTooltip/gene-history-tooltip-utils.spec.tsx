import 'jest-expect-message';
import constructTimeSeriesData, { formatLocation, getTimeSeriesDataContent } from './gene-history-tooltip-utils';
import { HistoryOperationType, HistoryRecord } from 'app/shared/model/firebase/firebase.model';
import React from 'react';
import * as firebaseUtils from 'app/shared/util/firebase/firebase-utils';
import { FlattenedHistory } from 'app/shared/util/firebase/firebase-history-utils';

describe('GeneHistoryTooltipUtils', () => {
  describe('getTimeSeriesDataContent', () => {
    it('should create non-empty time series data content with string new content', () => {
      const newContent = 'test';
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(newContent, oldContent);
      expect(timeSeriesDataContent).not.toEqual(<></>);
    });

    it('should create non-empty time series data content with valid object new content', () => {
      const newContent = {
        description: 'test',
      };
      const oldContent = '';

      const timeSeriesDataContent = getTimeSeriesDataContent(newContent as any, oldContent); // history collection does not align with model so necessary cast
      expect(timeSeriesDataContent).not.toEqual(<></>);
    });
  });

  describe('constructTimeSeriesData', () => {
    const USER_NAME = 'Test User 1';
    const ADMIN = 'Test Admin 1';
    const TIMESTAMP = 518022762874;

    it('should create time series data with add operation', () => {
      const record: FlattenedHistory = {
        lastEditBy: USER_NAME,
        location: '',
        new: 'Test',
        old: '',
        operation: HistoryOperationType.ADD,
        uuids: '',
        admin: ADMIN,
        timeStamp: TIMESTAMP,
      };

      const timeSeriesData = constructTimeSeriesData(record);
      expect(timeSeriesData.operation, 'operation should be "added"').toEqual('addition');
      expect(timeSeriesData.bubbleColor, 'bubble color should be "green"').toEqual('green');
      expect(timeSeriesData.content, 'content should be empty').toEqual(<></>);
    });

    it('should create time series data with update operation', () => {
      const record: FlattenedHistory = {
        lastEditBy: USER_NAME,
        location: '',
        new: 'Test',
        old: '',
        operation: HistoryOperationType.UPDATE,
        uuids: '',
        admin: ADMIN,
        timeStamp: TIMESTAMP,
      };

      const timeSeriesData = constructTimeSeriesData(record);
      expect(timeSeriesData.operation, 'operation should be "updated"').toEqual('update');
      expect(timeSeriesData.bubbleColor, 'bubble color should be "orange"').toEqual('orange');
      expect(timeSeriesData.content, 'content should be non empty').not.toEqual(<></>);
    });

    it('should create time series data with delete operation', () => {
      const record: FlattenedHistory = {
        lastEditBy: USER_NAME,
        location: '',
        new: null,
        old: null,
        operation: HistoryOperationType.DELETE,
        uuids: '',
        admin: ADMIN,
        timeStamp: TIMESTAMP,
      };

      expect(JSON.stringify(constructTimeSeriesData(record))).toEqual(
        JSON.stringify({
          createdAt: new Date(TIMESTAMP),
          admin: ADMIN,
          editBy: USER_NAME,
          operation: 'deletion',
          bubbleColor: 'red',
          content: <></>,
          location: '',
        }),
      );
    });

    it('should create time series data with name_change operation', () => {});

    it('should return undefined for invalid operation', () => {
      const record: FlattenedHistory = {
        lastEditBy: USER_NAME,
        location: '',
        new: null,
        old: null,
        operation: 'invalid' as HistoryOperationType,
        uuids: '',
        admin: ADMIN,
        timeStamp: TIMESTAMP,
      };

      expect(constructTimeSeriesData(record)).toBeUndefined();
    });
  });

  describe('formatLocation', () => {
    const TX_NAME = 'Test Tx';

    it('should format location for location string from history', () => {
      const spy = jest.spyOn(firebaseUtils, 'getTxName');
      spy.mockReturnValue(TX_NAME);

      // Can always pass empty object for drug list since mocking getTxName
      let location = 'Gene Summary';
      expect(formatLocation(location, [], '')).toBe(location);

      location = 'N127D, Mutation Effect';
      expect(formatLocation(location, [], 'description')).toBe('N127D, Mutation Effect, Description of Evidence');

      location = 'N127D, Mutation Effect';
      expect(formatLocation(location, [], 'oncogenic')).toBe('N127D, Mutation Effect, Oncogenic');

      location =
        'BCR-ABL1 Fusion, B-Lymphoblastic Leukemia/Lymphoma, STANDARD_THERAPEUTIC_IMPLICATIONS_FOR_DRUG_SENSITIVITY, f42768c5-4918-4244-98dd-6ea97a4d3c2a';
      expect(formatLocation(location, [], '')).toBe(`BCR-ABL1 Fusion, B-Lymphoblastic Leukemia/Lymphoma, ${TX_NAME}`);
    });

    it('should return input location if improperly formatted', () => {
      const location = 'BCR-ABL1 Fusion, B-Lymphoblastic Leukemia/Lymphoma, tx_implication, f42768c5-4918-4244-98dd-6ea97a4d3c2a';
      expect(formatLocation(location, [], '')).toBe(location);
    });
  });
});
