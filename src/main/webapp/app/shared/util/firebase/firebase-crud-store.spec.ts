import 'jest-expect-message';
import { FirebaseCrudStore } from './firebase-crud-store';

jest.mock('firebase/database', () => {
  const data = { field1: 'first field', arrayField: ['1', '2', '3'], field2: { innerField: 'test' } };
  const snapshot = { val: () => data };
  return {
    ref: jest.fn().mockImplementation((db, name) => {}),
    onValue: jest.fn().mockImplementation((db, callback) => {
      callback(snapshot);
      return function unsubscribe() {};
    }),
  };
});

jest.mock('./firebase-crud-store', () => {
  return {
    setDatabase: jest.fn().mockImplementation(() => {}),
  };
});

/* eslint-disable no-console */
describe('FirebaseCrudStore', () => {
  describe('addListener', () => {
    it('listens for data changes at a particular location', () => {
      const rootStore = {} as any;
      const store = new FirebaseCrudStore(rootStore);
      expect(FirebaseCrudStore).toHaveBeenCalledTimes(1);

      const listener = store.addListener('test/path');
      expect(store.data).toBeDefined();
    });
  });
});
