import { FirebaseGeneReviewService } from './firebase-gene-review-service';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { AuthStore } from 'app/stores';
import { FirebaseMetaService } from './firebase-meta-service';
import { FirebaseHistoryService } from './firebase-history-service';
import { FirebaseVusService } from './firebase-vus-service';
import { Gene, HistoryOperationType, Mutation, Review } from 'app/shared/model/firebase/firebase.model';
import { mock, mockReset } from 'jest-mock-extended';
import { SentryError } from 'app/config/sentry-error';
import { ReviewLevel } from 'app/shared/util/firebase/firebase-review-utils';
import { ReviewAction } from 'app/config/constants/firebase';
import _ from 'lodash';
import { ActionType } from 'app/pages/curation/collapsible/ReviewCollapsible';
import { generateUuid } from 'app/shared/util/utils';

describe('Firebase Gene Review Service', () => {
  const DEFAULT_USERNAME = 'Test User';
  const DEFAULT_DATE = new Date('2023-01-01');
  const DEFAULT_DATETIME_STRING = DEFAULT_DATE.getTime().toString();
  const DEFAULT_UUID = generateUuid();
  let MOCKED_ARRAY_KEYS: string[] = [];
  const mockFirebaseRepository = mock<FirebaseRepository>();
  const mockAuthStore = mock<AuthStore>();
  const mockMetaService = mock<FirebaseMetaService>();
  const mockHistoryService = mock<FirebaseHistoryService>();
  const mockVusService = mock<FirebaseVusService>();
  let firebaseGeneReviewService: FirebaseGeneReviewService;

  beforeEach(() => {
    mockReset(mockFirebaseRepository);
    mockReset(mockAuthStore);
    mockReset(mockMetaService);
    mockReset(mockHistoryService);
    mockReset(mockVusService);
    firebaseGeneReviewService = new FirebaseGeneReviewService(
      mockFirebaseRepository,
      mockAuthStore,
      mockMetaService,
      mockHistoryService,
      mockVusService,
    );
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);

    // Use original implementation for certain methods
    mockMetaService.getUpdateObject.mockImplementation((add, hugoSymbol, isGermline, uuid) => {
      const originalMetaService = new FirebaseMetaService(mockFirebaseRepository, mockAuthStore);
      return originalMetaService.getUpdateObject(add, hugoSymbol, isGermline, uuid);
    });

    mockHistoryService.getUpdateObject.mockImplementation((history, hugoSymbol, isGermline) => {
      const originalHistoryService = new FirebaseHistoryService(mockFirebaseRepository);
      return originalHistoryService.getUpdateObject(history, hugoSymbol, isGermline);
    });

    mockVusService.getVusUpdateObject.mockImplementation((path, variants) => {
      const originalVusService = new FirebaseVusService(mockFirebaseRepository, mockAuthStore);
      return originalVusService.getVusUpdateObject(path, variants);
    });

    mockAuthStore.account = {
      id: '1',
      login: 'test@oncokb.org',
      firstName: 'test',
      lastName: 'user',
      email: 'test@oncokb.org',
      activated: true,
      langKey: '',
      authorities: [],
      createdBy: '',
      createdDate: null,
      lastModifiedBy: '',
      lastModifiedDate: null,
      imageUrl: '',
    };

    MOCKED_ARRAY_KEYS = [];
    mockFirebaseRepository.getArrayKey.mockImplementation(() => {
      const key = `mocked-key-${MOCKED_ARRAY_KEYS.length}`;
      MOCKED_ARRAY_KEYS.push(key);
      return key;
    });
  });

  describe('updateReviewableContent', () => {
    it('should update to firebase path with correct object', async () => {
      await firebaseGeneReviewService.updateReviewableContent(
        'Genes/BRAF/mutations/0/description',
        'old',
        'new',
        new Review(mockAuthStore.fullName),
        DEFAULT_UUID,
      );
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith(
        '/',
        expect.objectContaining({
          'Genes/BRAF/mutations/0/description': 'new',
          'Genes/BRAF/mutations/0/description_review': {
            lastReviewed: 'old',
            updateTime: DEFAULT_DATE.getTime(),
            updatedBy: mockAuthStore.fullName,
          },
          'Genes/BRAF/mutations/0/description_uuid': DEFAULT_UUID,
          'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
          'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
          [`Meta/BRAF/review/${DEFAULT_UUID}`]: true,
        }),
      );
    });
    it('should update germline content', async () => {
      await firebaseGeneReviewService.updateReviewableContent(
        'Germline_Genes/BRAF/summary',
        'old',
        'new',
        new Review(mockAuthStore.fullName),
        DEFAULT_UUID,
      );
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith(
        '/',
        expect.objectContaining({
          'Germline_Genes/BRAF/summary': 'new',
          'Germline_Genes/BRAF/summary_review': {
            lastReviewed: 'old',
            updateTime: DEFAULT_DATE.getTime(),
            updatedBy: mockAuthStore.fullName,
          },
          'Germline_Genes/BRAF/summary_uuid': DEFAULT_UUID,
          'Germline_Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
          'Germline_Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
          [`Germline_Meta/BRAF/review/${DEFAULT_UUID}`]: true,
        }),
      );
    });
    it('should throw SentryError when FirebaseRepository update fails', async () => {
      mockFirebaseRepository.update.mockRejectedValueOnce(new Error('Firebase repository update failed'));
      await expect(
        firebaseGeneReviewService.updateReviewableContent(
          'Genes/BRAF/mutations/0/description',
          'old',
          'new',
          new Review(DEFAULT_USERNAME),
          'uuid',
        ),
      ).rejects.toThrow(SentryError);
    });
  });

  describe('acceptChanges', () => {
    it('should accept updates', async () => {
      const hugoSymbol = 'BRAF';
      const gene = new Gene(hugoSymbol);
      gene.background = 'test';
      gene.background_review = new Review(mockAuthStore.fullName, '');
      const reviewLevel = new ReviewLevel({
        titleParts: ['Background'],
        valuePath: 'background',
        historyLocation: 'Background',
        currentVal: 'test',
        reviewInfo: {
          reviewPath: 'background_review',
          review: gene.background_review,
          lastReviewedString: '',
          uuid: gene.background_uuid,
          reviewAction: ReviewAction.UPDATE,
        },
        historyData: {
          oldState: '',
          newState: 'test',
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);
      // We expect the lastReviewed to be cleared when accepting changes
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        [`History/BRAF/api/${MOCKED_ARRAY_KEYS[0]}`]: {
          admin: mockAuthStore.fullName,
          records: [
            {
              location: 'Background',
              old: '',
              new: gene.background,
              operation: HistoryOperationType.UPDATE,
            },
          ],
        },
        'Genes/BRAF/background_review': {
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${gene.background_uuid}`]: null,
      });
    });
    it('should delete from array when accepting deletion', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, undefined, true);
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E'],
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DELETE,
        },
        historyData: {
          oldState: mutation,
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);
      expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [0]);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        [`History/BRAF/api/${MOCKED_ARRAY_KEYS[0]}`]: {
          admin: mockAuthStore.fullName,
          records: [
            {
              location: 'V600E',
              old: mutation,
              operation: HistoryOperationType.DELETE,
            },
          ],
        },
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
      });
    });
    it('should add alterations to VUS collection when demoting a mutation', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E, V600K';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User');
      mutation.name_review.demotedToVus = true;
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E, V600K'],
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E, V600K',
        currentVal: 'V600E, V600K',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DEMOTE_MUTATION,
        },
        historyData: {
          oldState: mutation,
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);
      expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [0]);
      // We expect both alterations (V600E and V600K) to be added to VUS list
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        [`History/BRAF/api/${MOCKED_ARRAY_KEYS[0]}`]: {
          admin: mockAuthStore.fullName,
          records: [
            {
              location: 'V600E, V600K',
              old: mutation,
              operation: HistoryOperationType.DEMOTE_MUTATION,
            },
          ],
        },
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        [`VUS/BRAF/${MOCKED_ARRAY_KEYS[1]}`]: {
          name: 'V600E',
        },
        [`VUS/BRAF/${MOCKED_ARRAY_KEYS[2]}`]: {
          name: 'V600K',
        },
      });
    });
    it('should accept newly created entity', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, true);
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E'],
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.CREATE,
        },
        historyData: {
          newState: mutation,
        },
        historyInfo: {},
      });
      // An entity is created once all its changes have been accepted or rejected.
      await firebaseGeneReviewService.handleCreateAction(hugoSymbol, reviewLevel, false, ActionType.ACCEPT);
      const expectedMutation = _.cloneDeep(mutation);
      delete expectedMutation.name_review?.added;
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        [`History/BRAF/api/${MOCKED_ARRAY_KEYS[0]}`]: {
          admin: mockAuthStore.fullName,
          records: [
            {
              location: 'V600E',
              new: mutation,
              operation: HistoryOperationType.ADD,
              uuids: mutation.name_uuid,
            },
          ],
        },
        'Genes/BRAF/mutations/0': expectedMutation,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });
  });
  describe('rejectChanges', () => {
    it('should delete lastReviewed and set value back to lastReviewed when rejecting update', async () => {
      const hugoSymbol = 'BRAF';
      const gene = new Gene(hugoSymbol);
      gene.background = 'test';
      gene.background_review = new Review('User', '');
      const reviewLevel = new ReviewLevel({
        titleParts: ['Background'],
        valuePath: 'background',
        historyLocation: 'Background',
        currentVal: 'test',
        reviewInfo: {
          reviewPath: 'background_review',
          review: gene.background_review,
          lastReviewedString: '',
          uuid: gene.background_uuid,
          reviewAction: ReviewAction.UPDATE,
        },
        historyData: {
          oldState: '',
          newState: 'test',
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.rejectChanges(hugoSymbol, [reviewLevel], false);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Genes/BRAF/background': '',
        'Genes/BRAF/background_review': { updateTime: DEFAULT_DATE.getTime(), updatedBy: mockAuthStore.fullName },
        [`Meta/BRAF/review/${gene.background_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });

    it('should clear review object when rejecting a deletion', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, undefined, true);
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E'],
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DELETE,
        },
        historyData: {
          oldState: mutation,
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.rejectChanges(hugoSymbol, [reviewLevel], false);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Genes/BRAF/mutations/0/name_review': { updateTime: DEFAULT_DATE.getTime(), updatedBy: mockAuthStore.fullName },
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });

    // With the change to move action buttons to individual collapsibles under a CREATED collapsible,
    // there is no longer a way to reject it. Once we bring back that feature, we should re-enable this test.
    // it('should add alterations back to VUS list if promotion to mutation is rejected', async () => {
    //   const hugoSymbol = 'BRAF';
    //   const mutationName = 'V600E, V600K';
    //   const mutation = new Mutation(mutationName);
    //   mutation.name_review = new Review('User');
    //   mutation.name_review.promotedToMutation = true;
    //   const reviewLevel = new ReviewLevel({
    //     title: 'V600E, V600K',
    //     valuePath: 'mutations/12/name',
    //     historyLocation: 'V600E, V600K',
    //     currentVal: 'V600E, V600K',
    //     reviewInfo: {
    //       reviewPath: 'mutations/0/name_review',
    //       review: mutation.name_review,
    //       lastReviewedString: undefined,
    //       uuid: mutation.name_uuid,
    //       reviewAction: ReviewAction.PROMOTE_VUS,
    //     },
    //     historyData: {
    //       oldState: mutation,
    //     },
    //     historyInfo: {},
    //   });
    //   await firebaseGeneReviewService.handleCreateAction(hugoSymbol, reviewLevel, false, ActionType.REJECT);

    //   expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [12]);
    //   // We expect both alterations (V600E and V600K) to be added back to VUS list
    //   expect(mockVusService.addVus).toHaveBeenCalledWith('VUS/BRAF', ['V600E', 'V600K']);
    // });
  });
});
