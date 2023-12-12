import 'jest-expect-message';
import { groupTimeSeriesDataByDay } from './time-series-utils';

const EDIT_BY = 'Test User';
const OPERATION = 'added';
const BUBBLE_COLOR = 'blue';
const CONTENT = 'test content';

const dates = [
  new Date('2023-06-15T16:45:00.000Z'),
  new Date('2023-03-20T15:25:00.000Z'),
  new Date('2023-08-28T11:20:00.000Z'),
  new Date('2023-08-28T17:50:00.000Z'),
  new Date('2023-06-15T08:30:00.000Z'),
  new Date('2023-10-12T13:15:00.000Z'),
  new Date('2023-03-20T10:45:00.000Z'),
  new Date('2023-12-05T21:30:00.000Z'),
  new Date('2023-08-28T20:15:00.000Z'),
  new Date('2023-10-12T18:05:00.000Z'),
];

const expectedGroupedDates = {
  '2023-10-12T00:00:00.000Z': [
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-10-12T18:05:00.000Z'),
    },
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-10-12T13:15:00.000Z'),
    },
  ],
  '2023-06-15T00:00:00.000Z': [
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-06-15T16:45:00.000Z'),
    },
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-06-15T08:30:00.000Z'),
    },
  ],
  '2023-03-20T00:00:00.000Z': [
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-03-20T15:25:00.000Z'),
    },
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-03-20T10:45:00.000Z'),
    },
  ],
  '2023-08-28T00:00:00.000Z': [
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-08-28T20:15:00.000Z'),
    },
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-08-28T17:50:00.000Z'),
    },
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-08-28T11:20:00.000Z'),
    },
  ],
  '2023-12-05T00:00:00.000Z': [
    {
      editBy: EDIT_BY,
      operation: OPERATION,
      bubbleColor: BUBBLE_COLOR,
      content: CONTENT,
      createdAt: new Date('2023-12-05T21:30:00.000Z'),
    },
  ],
};

describe('TimeSeriesUtils', () => {
  it('should group time series data by day and sort each group by time', () => {
    const timeSeriesEventData = dates.map(date => {
      return {
        editBy: EDIT_BY,
        operation: OPERATION,
        bubbleColor: BUBBLE_COLOR,
        content: CONTENT,
        createdAt: date,
      };
    });

    const groupedDates = groupTimeSeriesDataByDay(timeSeriesEventData);
    expect(groupedDates, 'should be grouped by date and sorted by time').toEqual(expectedGroupedDates);
  });
});
