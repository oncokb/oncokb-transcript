// const mockUpdate = jest.fn().mockImplementation((db, value) => Promise.resolve());
// const mockRemove = jest.fn().mockImplementation((db, value) => {});
// const mockRef = jest.fn().mockImplementation(db => {});
// const mockUuidReturnValue = 'fake-uuid';

// import 'jest-expect-message';
// import { FirebaseReviewableCrudStore } from './firebase-reviewable-crud-store';
// import { FirebaseMetaStore } from 'app/stores/firebase/firebase.meta.store';
// import FirebaseStore from 'app/stores/firebase/firebase.store';
// import { Review } from 'app/shared/model/firebase/firebase.model';

// jest.mock('firebase/database', () => {
//   return {
//     ref: mockRef,
//     update: mockUpdate,
//     remove: mockRemove,
//   };
// });

// jest.mock('uuid', () => ({ v4: jest.fn().mockReturnValue(mockUuidReturnValue) }));

// const updateGeneMetaContentMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneMetaContent').mockReturnValue(Promise.resolve());
// const updateGeneReviewUuidMock = jest.spyOn(FirebaseMetaStore.prototype, 'updateGeneReviewUuid').mockReturnValue(Promise.resolve());

// type Test = {
//   key: string;
//   key_uuid: string;
//   key_review?: Review;
// };

// describe('FirebaseReviewableCrudStore', () => {
//   // Variables used in tests
//   let rootStore = undefined;
//   const DEFAULT_DATE = new Date('2023-01-01');
//   const DEFAULT_OLD_DATE = new Date('2020-01-01');
//   const DEFAULT_UUID = mockUuidReturnValue;
//   const DEFAULT_USER = 'test user';
//   const UPDATED_USER = 'some user';
//   const DEFAULT_INITIAL_VALUE = '';
//   const DEFAULT_VALUE = 'original';
//   const UPDATED_VALUE_A = 'new value';
//   const UPDATED_VALUE_B = 'new value 2';

//   class TestRootStore {
//     firebaseStore;
//     firebaseMetaStore;
//     authStore;
//     constructor() {
//       this.firebaseStore = new FirebaseStore(this as any);
//       this.firebaseMetaStore = new FirebaseMetaStore(this as any);
//       this.authStore = { fullName: DEFAULT_USER };
//     }
//   }

//   const reset = () => {
//     jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
//     rootStore = new TestRootStore();
//     jest.clearAllMocks();
//   };

//   describe('updateReviewableContent', () => {
//     beforeEach(() => reset());

//     it('should correctly update field that was already reviewed', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//       store.data = { key: DEFAULT_VALUE, key_uuid: DEFAULT_UUID };

//       await store.updateReviewableContent('Gene/ABL1', 'key', UPDATED_VALUE_A);

//       // Check if field and field_review were updated
//       // lastReviewed should be set because the field was already reviewed and we are making a new change
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         key: UPDATED_VALUE_A,
//         key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER, lastReviewed: DEFAULT_VALUE },
//       });

//       // Check if Meta information was updated
//       expect(updateGeneMetaContentMock).toHaveBeenNthCalledWith(1, 'ABL1');

//       // Check if we add uuid to meta
//       expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'ABL1', DEFAULT_UUID, true);
//     });

//     it('should set lastReviewed to empty string when content has never been reviewed before', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//       store.data = { key: DEFAULT_INITIAL_VALUE, key_uuid: DEFAULT_UUID };

//       await store.updateReviewableContent('Gene/ABL1', 'key', UPDATED_VALUE_A);

//       // When a field does not have _review, it means that it was never reviewed before.
//       // In this case, the lastReviewed property should be empty string
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         key: UPDATED_VALUE_A,
//         key_review: { lastReviewed: DEFAULT_INITIAL_VALUE, updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
//       });

//       expect(updateGeneMetaContentMock).toHaveBeenNthCalledWith(1, 'ABL1');

//       expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'ABL1', DEFAULT_UUID, true);
//     });

//     it('should not update lastReviewed when it is present', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//       store.data = { key: UPDATED_VALUE_A, key_uuid: DEFAULT_UUID, key_review: { lastReviewed: DEFAULT_VALUE } } as Test;

//       await store.updateReviewableContent('Gene/ABL1', 'key', UPDATED_VALUE_B);

//       // lastReviewed should not be updated because we it was already set
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         key: UPDATED_VALUE_B,
//         key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER, lastReviewed: DEFAULT_VALUE },
//       });
//     });

//     it('should add uuid when not present', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//       store.data = { key: DEFAULT_VALUE } as Test;

//       await store.updateReviewableContent('Gene/ABL1', 'key', UPDATED_VALUE_A);

//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         key: UPDATED_VALUE_A,
//         key_uuid: DEFAULT_UUID,
//         key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER, lastReviewed: DEFAULT_VALUE },
//       });
//     });

//     describe('when value is reverted to original', () => {
//       beforeEach(() => reset());

//       it('should remove lastReviewed when original value was a non-empty string', async () => {
//         const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//         store.data = {
//           key: UPDATED_VALUE_A,
//           key_uuid: DEFAULT_UUID,
//           key_review: { lastReviewed: DEFAULT_VALUE, updatedBy: DEFAULT_USER, updateTime: DEFAULT_DATE.getTime() },
//         };

//         await store.updateReviewableContent('Gene/ABL1', 'key', DEFAULT_VALUE);

//         expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//           key: DEFAULT_VALUE,
//           key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
//         });

//         // After successfull update to field, we expect the lastReviewed field to be removed
//         expect(mockRef).toHaveBeenNthCalledWith(2, undefined, `Gene/ABL1/key_review/lastReviewed`);
//       });

//       it('should remove lastReviewed when original value was empty string', async () => {
//         const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//         store.data = {
//           key: UPDATED_VALUE_A,
//           key_uuid: DEFAULT_UUID,
//           key_review: { lastReviewed: DEFAULT_INITIAL_VALUE, updatedBy: DEFAULT_USER, updateTime: DEFAULT_DATE.getTime() },
//         };

//         await store.updateReviewableContent('Gene/ABL1', 'key', DEFAULT_INITIAL_VALUE);

//         expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//           key: DEFAULT_INITIAL_VALUE,
//           key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
//         });

//         // After successfull update to field, we expect the lastReviewed field to be removed
//         expect(mockRef).toHaveBeenNthCalledWith(2, undefined, `Gene/ABL1/key_review/lastReviewed`);
//       });

//       it('should remove uuid from meta', async () => {
//         const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//         store.data = {
//           key: UPDATED_VALUE_A,
//           key_uuid: DEFAULT_UUID,
//           key_review: { lastReviewed: DEFAULT_VALUE, updatedBy: DEFAULT_USER, updateTime: DEFAULT_DATE.getTime() },
//         };

//         await store.updateReviewableContent('Gene/ABL1', 'key', DEFAULT_VALUE);

//         expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//           key: DEFAULT_VALUE,
//           key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER },
//         });

//         // Check if UUID is removed from meta collection
//         expect(updateGeneReviewUuidMock).toHaveBeenNthCalledWith(1, 'ABL1', DEFAULT_UUID, false);
//       });
//     });

//     it('should update timestamp and author', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);
//       store.data = {
//         key: UPDATED_VALUE_A,
//         key_uuid: DEFAULT_UUID,
//         key_review: { lastReviewed: DEFAULT_VALUE, updatedBy: UPDATED_USER, updateTime: DEFAULT_OLD_DATE.getTime() },
//       };

//       await store.updateReviewableContent('Gene/ABL1', 'key', UPDATED_VALUE_B);

//       // timestamp and author should be updated
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         key: UPDATED_VALUE_B,
//         key_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: DEFAULT_USER, lastReviewed: DEFAULT_VALUE },
//       });
//     });

//     it('should not update when path does not contain hugoSymbol', async () => {
//       const store = new FirebaseReviewableCrudStore<Test>(rootStore);

//       await expect(store.updateReviewableContent('Gene', 'key', UPDATED_VALUE_A)).rejects.toThrow();

//       expect(mockUpdate).toHaveBeenCalledTimes(0);
//       expect(updateGeneMetaContentMock).toHaveBeenCalledTimes(0);
//       expect(updateGeneReviewUuidMock).toHaveBeenCalledTimes(0);
//     });
//   });
// });
