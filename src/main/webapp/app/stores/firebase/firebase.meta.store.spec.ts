// const mockUpdate = jest.fn().mockImplementation((db, value) => {});
// const mockRemove = jest.fn().mockImplementation((db, value) => {});
// const mockRef = jest.fn().mockImplementation(db => {});
// const mockRunTransaction = jest.fn().mockImplementation((db, transactionUpdate) => {});

// import 'jest-expect-message';
// import { FirebaseMetaService } from '../../service/firebase/firebase-meta-service';
// import { generateUuid } from 'app/shared/util/utils';

// jest.mock('firebase/database', () => {
//   return {
//     ref: mockRef,
//     update: mockUpdate,
//     remove: mockRemove,
//     runTransaction: mockRunTransaction,
//   };
// });

// describe('FirebaseMetaStore', () => {
//   let rootStore = undefined;
//   const DEFAULT_DATE = new Date('2023-09-21');

//   const reset = () => {
//     jest.useFakeTimers().setSystemTime(DEFAULT_DATE);
//     rootStore = { firebaseStore: {}, authStore: { fullName: 'test user' } } as any;
//     jest.clearAllMocks();
//   };

//   describe('updateGeneMetaContent', () => {
//     beforeEach(() => reset());

//     it('should update lastModifiedBy and lastModifiedAt fields', async () => {
//       const store = new FirebaseMetaService(rootStore);
//       await store.updateGeneMetaContent('ABL1', false);

//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, {
//         lastModifiedBy: 'test user',
//         lastModifiedAt: DEFAULT_DATE.getTime().toString(),
//       });
//     });

//     it('should update to the correct location', async () => {
//       const store = new FirebaseMetaService(rootStore);
//       await store.updateGeneMetaContent('BRAF', false);

//       expect(mockRef).toHaveBeenNthCalledWith(1, undefined, 'Meta/BRAF');
//     });
//   });

//   describe('updateGeneReviewUuid', () => {
//     beforeEach(() => reset());

//     it('should add uuid to gene meta review', async () => {
//       const store = new FirebaseMetaService(rootStore);
//       const testUuid = generateUuid();
//       await store.updateGeneReviewUuid('EGFR', testUuid, true, false);

//       const reviewKey = `review/${testUuid}`;
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, { [reviewKey]: true });

//       // Check the path for updated data
//       expect(mockRef).toHaveBeenNthCalledWith(1, undefined, 'Meta/EGFR');
//     });

//     it('should remove uuid from gene meta review', async () => {
//       const store = new FirebaseMetaService(rootStore);
//       const testUuid = generateUuid();
//       await store.updateGeneReviewUuid('FLT3', testUuid, false, false);

//       // Should call the firebase remove() function
//       expect(mockRemove).toHaveBeenCalledTimes(1);

//       // Check the path for removed data
//       expect(mockRef).toHaveBeenNthCalledWith(1, undefined, `Meta/FLT3/review/${testUuid}`);
//     });
//   });

//   describe('updateCollaborator', () => {
//     let store = undefined;
//     const DEFAULT_USER = 'test user';
//     const NON_EXISTENT_USER = 'fake user';
//     const GENE_LIST = ['ABL1', 'BRAF', 'EGFR'];

//     beforeEach(() => {
//       reset();
//       store = new FirebaseMetaService(rootStore);
//       store.metaCollaborators = { [DEFAULT_USER]: GENE_LIST };
//     });

//     it('should add gene to collaborator list', async () => {
//       expect(store.metaCollaborators).toBeDefined();

//       await store.updateCollaborator('APC', true);

//       // Check update value
//       expect(mockUpdate).toHaveBeenCalledTimes(1);
//       expect(mockUpdate).toHaveBeenNthCalledWith(1, undefined, { [GENE_LIST.length]: 'APC' });

//       // Check the path for updated data
//       expect(mockRef).toHaveBeenNthCalledWith(1, undefined, `Meta/collaborators/${DEFAULT_USER}`);
//     });

//     it('should not add duplicate gene to collaborator list', async () => {
//       expect(store.metaCollaborators).toBeDefined();

//       await store.updateCollaborator('ABL1', true);

//       // Should not update to firebase because gene already in list
//       expect(mockUpdate).toHaveBeenCalledTimes(0);
//     });

//     it('should remove gene from collaborator list', async () => {
//       expect(store.metaCollaborators).toBeDefined();

//       await store.updateCollaborator('ABL1', false);

//       // Should run transaction to remove the hugo symbol by index
//       expect(mockRunTransaction).toHaveBeenCalledTimes(1);
//       expect(mockRef).toHaveBeenNthCalledWith(1, undefined, `Meta/collaborators/${DEFAULT_USER}`);
//     });

//     it('should not call remove when gene is not in collaborator list', async () => {
//       expect(store.metaCollaborators).toBeDefined();

//       await store.updateCollaborator(NON_EXISTENT_USER, false);

//       expect(mockRemove).toHaveBeenCalledTimes(0);
//     });

//     it('should throw exception if collaborator name is undefined', async () => {
//       rootStore.authStore.fullName = undefined;

//       await expect(store.updateCollaborator('ABL1', true)).rejects.toThrow();

//       await expect(store.updateCollaborator('ABL1', false)).rejects.toThrow();
//     });
//   });
// });
