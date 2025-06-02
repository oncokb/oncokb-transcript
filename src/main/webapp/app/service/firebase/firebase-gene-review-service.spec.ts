import { FirebaseGeneReviewService } from './firebase-gene-review-service';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { AuthStore } from 'app/stores';
import { FirebaseMetaService } from './firebase-meta-service';
import { FirebaseHistoryService } from './firebase-history-service';
import { FirebaseVusService } from './firebase-vus-service';
import { Gene, HistoryOperationType, Mutation, Review, Tumor } from 'app/shared/model/firebase/firebase.model';
import { mock, mockReset } from 'jest-mock-extended';
import { SentryError } from 'app/config/sentry-error';
import { getTumorNameUuid, ReviewLevel, TumorReviewLevel } from 'app/shared/util/firebase/firebase-review-utils';
import { ReviewAction } from 'app/config/constants/firebase';
import _ from 'lodash';
import { ActionType } from 'app/pages/curation/collapsible/ReviewCollapsible';
import { EvidenceApi } from 'app/shared/api/manual/evidence-api';
import { createMockGene, createMockMutation } from 'app/shared/util/core-submission-shared/core-submission.mocks';
import { GeneTypeApi } from 'app/shared/api/manual/gene-type-api';
import { generateUuid } from 'app/shared/util/utils';
import FirebaseAppStore from 'app/stores/firebase/firebase-app.store';

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
  const mockEvidenceClient = mock<EvidenceApi>();
  const mockGeneTypeClient = mock<GeneTypeApi>();
  const mockFirebaseAppStore = mock<FirebaseAppStore>();
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
      mockEvidenceClient,
      mockGeneTypeClient,
    );
    jest.useFakeTimers().setSystemTime(DEFAULT_DATE);

    // Use original implementation for certain methods
    mockMetaService.getUpdateObject.mockImplementation((hugoSymbol, isGermline, uuidUpdateObjects) => {
      const originalMetaService = new FirebaseMetaService(mockFirebaseRepository, mockAuthStore);
      return originalMetaService.getUpdateObject(hugoSymbol, isGermline, uuidUpdateObjects);
    });

    mockHistoryService.getUpdateObject.mockImplementation((history, hugoSymbol, isGermline) => {
      const originalHistoryService = new FirebaseHistoryService(mockFirebaseRepository);
      return originalHistoryService.getUpdateObject(history, hugoSymbol, isGermline);
    });

    mockVusService.getVusUpdateObject.mockImplementation((path, variants) => {
      const originalVusService = new FirebaseVusService(mockFirebaseRepository, mockEvidenceClient, mockAuthStore);
      return originalVusService.getVusUpdateObject(path, variants);
    });

    mockFirebaseRepository.deleteFromArray.mockImplementation((arrayPath, arrayKeysToDelete, commit) => {
      const originalRepository = new FirebaseRepository(mockFirebaseAppStore);
      return originalRepository.deleteFromArray(arrayPath, arrayKeysToDelete, commit);
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

      await firebaseGeneReviewService.acceptChanges({
        hugoSymbol,
        reviewLevels: [reviewLevel],
        isGermline: false,
        gene,
        drugListRef: {},
        entrezGeneId: 0,
      });

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
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
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

      await firebaseGeneReviewService.acceptChanges({
        hugoSymbol,
        reviewLevels: [reviewLevel],
        isGermline: false,
        gene: createMockGene({
          name: hugoSymbol,
          mutations: { [generateUuid()]: createMockMutation() },
        }),
        drugListRef: {},
        entrezGeneId: 0,
      });

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
        'Genes/BRAF/mutations/-mKey': null,
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
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E, V600K',
        currentVal: 'V600E, V600K',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
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

      await firebaseGeneReviewService.acceptChanges({
        hugoSymbol,
        reviewLevels: [reviewLevel],
        isGermline: false,
        gene: createMockGene({
          name: hugoSymbol,
          mutations: { [generateUuid()]: createMockMutation() },
        }),
        drugListRef: {},
        entrezGeneId: 0,
      });

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
        'Genes/BRAF/mutations/-mKey': null,
      });
    });
    it('should accept newly created entity', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, true);
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E'],
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
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
        'Genes/BRAF/mutations/-mKey': expectedMutation,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });
    it('should remove nested review level uuids from meta collection when accepting a deletion', async () => {
      const hugoSymbol = 'BRAF';
      const gene = new Gene(hugoSymbol);
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, undefined, true);
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E'],
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
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
      mutation.summary_review = new Review('User', 'Old summary');
      const childReview = new ReviewLevel({
        titleParts: ['Summary'],
        valuePath: 'mutations/-mKey/summary',
        historyLocation: 'V600E, Summary',
        currentVal: 'Test summary',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/summary',
          review: mutation.summary_review,
          lastReviewedString: undefined,
          uuid: mutation.summary_uuid,
          reviewAction: ReviewAction.UPDATE,
        },
        historyData: {},
        historyInfo: {},
      });

      reviewLevel.addChild(childReview);

      await firebaseGeneReviewService.acceptChanges({
        hugoSymbol,
        reviewLevels: [reviewLevel],
        isGermline: false,
        gene,
        drugListRef: {},
        entrezGeneId: 0,
      });

      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      // We expect nested review level uuid to be remove if a deletion has been accepted.
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        [`Meta/BRAF/review/${mutation.summary_uuid}`]: null,
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
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
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
        'Genes/BRAF/mutations/-mKey/name_review': { updateTime: DEFAULT_DATE.getTime(), updatedBy: mockAuthStore.fullName },
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });
    it('should reject initial excluded cancer type', async () => {
      const mutation = new Mutation('V600E');
      const tumor = new Tumor();
      tumor.cancerTypes = { '-ctKey': { code: '', subtype: '', mainType: 'Melanoma' } };
      tumor.cancerTypes_review = new Review('User');
      tumor.excludedCancerTypes = { '-ectKey': { code: 'OCM', subtype: 'Ocular Melanoma', mainType: 'Melanoma' } };
      tumor.excludedCancerTypes_review = new Review('User', undefined, false, false, true);
      tumor.excludedCancerTypes_uuid = generateUuid();
      mutation.tumors['-tKey'] = tumor;

      const reviewLevel = new TumorReviewLevel({
        titleParts: ['Oncogenic Mutations', 'Breast Cancer {excluding Metaplastic Breast Cancer}', 'Name'],
        valuePath: 'mutations/-mKey/tumors/-tKey/cancerTypes',
        historyLocation: 'Oncogenic Mutations, Breast Cancer {excluding Metaplastic Breast Cancer}',
        children: [],
        historyInfo: {},
        currentVal: 'Breast Cancer {excluding Metaplastic Breast Cancer}',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/tumors/-tKey/cancerTypes_review',
          review: tumor.cancerTypes_review,
          lastReviewedString: 'Breast Cancer',
          uuid: getTumorNameUuid(tumor.cancerTypes_uuid, tumor.excludedCancerTypes_uuid),
          reviewAction: 3,
        },
        historyData: {
          oldState: 'Breast Cancer',
          newState: 'Breast Cancer {excluding Metaplastic Breast Cancer}',
        },
        excludedCancerTypesReviewInfo: {
          reviewPath: 'mutations/-mKey/tumors/-tKey/excludedCancerTypes_review',
          review: tumor.excludedCancerTypes_review,
          lastReviewedString: undefined,
          uuid: tumor.excludedCancerTypes_uuid,
        },
        currentExcludedCancerTypes: [
          {
            code: 'MBC',
            mainType: 'Breast Cancer',
            subtype: 'Metaplastic Breast Cancer',
          },
        ],
      });

      await firebaseGeneReviewService.rejectChanges('BRAF', [reviewLevel], false);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/cancerTypes_review': {
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/excludedCancerTypes': null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${getTumorNameUuid(tumor.cancerTypes_uuid, tumor.excludedCancerTypes_uuid)}`]: null,
        [`Meta/BRAF/review/${tumor.cancerTypes_uuid}`]: null,
        [`Meta/BRAF/review/${tumor.excludedCancerTypes_uuid}`]: null,
      });
    });

    it('should reject initial excluded cancer type', async () => {
      const mutation = new Mutation('V600E');
      const tumor = new Tumor();
      tumor.cancerTypes = { '-ctKey': { code: '', subtype: '', mainType: 'Melanoma' } };
      tumor.cancerTypes_review = new Review('User');
      tumor.excludedCancerTypes = { '-ectKey': { code: 'OCM', subtype: 'Ocular Melanoma', mainType: 'Melanoma' } };
      tumor.excludedCancerTypes_review = new Review('User', undefined, false, false, true);
      tumor.excludedCancerTypes_uuid = generateUuid();
      mutation.tumors['-tKey'] = tumor;

      const reviewLevel = new TumorReviewLevel({
        titleParts: ['Oncogenic Mutations', 'Breast Cancer {excluding Metaplastic Breast Cancer}', 'Name'],
        valuePath: 'mutations/-mKey/tumors/-tKey/cancerTypes',
        historyLocation: 'Oncogenic Mutations, Breast Cancer {excluding Metaplastic Breast Cancer}',
        children: [],
        historyInfo: {},
        currentVal: 'Breast Cancer {excluding Metaplastic Breast Cancer}',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/tumors/-tKey/cancerTypes_review',
          review: tumor.cancerTypes_review,
          lastReviewedString: 'Breast Cancer',
          uuid: getTumorNameUuid(tumor.cancerTypes_uuid, tumor.excludedCancerTypes_uuid),
          reviewAction: 3,
        },
        historyData: {
          oldState: 'Breast Cancer',
          newState: 'Breast Cancer {excluding Metaplastic Breast Cancer}',
        },
        excludedCancerTypesReviewInfo: {
          reviewPath: 'mutations/-mKey/tumors/-tKey/excludedCancerTypes_review',
          review: tumor.excludedCancerTypes_review,
          lastReviewedString: undefined,
          uuid: tumor.excludedCancerTypes_uuid,
        },
        currentExcludedCancerTypes: [
          {
            code: 'MBC',
            mainType: 'Breast Cancer',
            subtype: 'Metaplastic Breast Cancer',
          },
        ],
      });

      await firebaseGeneReviewService.rejectChanges('BRAF', [reviewLevel], false);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/cancerTypes_review': {
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/excludedCancerTypes': null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${getTumorNameUuid(tumor.cancerTypes_uuid, tumor.excludedCancerTypes_uuid)}`]: null,
        [`Meta/BRAF/review/${tumor.cancerTypes_uuid}`]: null,
        [`Meta/BRAF/review/${tumor.excludedCancerTypes_uuid}`]: null,
      });
    });

    it('should reject initial excluded RCT', async () => {
      const mutation = new Mutation('V600E');
      const tumor = new Tumor();
      tumor.cancerTypes = { '-ctKey': { code: '', subtype: '', mainType: 'Melanoma' } };
      tumor.diagnostic.excludedRCTs = { '-rctKey': { code: 'TEST', subtype: 'Melanoma Subtype', mainType: 'Melanoma' } };
      tumor.diagnostic.excludedRCTs_review = new Review('User', undefined, false, false, true);
      tumor.diagnostic.excludedRCTs_uuid = generateUuid();
      mutation.tumors['-tKey'] = tumor;

      const reviewLevel = new ReviewLevel({
        titleParts: ['Relevant Cancer Types'],
        valuePath: 'mutations/-mKey/tumors/-tKey/diagnostic/excludedRCTs',
        historyLocation: 'V600E, Melanoma, Diagnostic, Relevant Cancer Types',
        children: [],
        historyInfo: {},
        currentVal: 'Melanoma Subtype',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/tumors/-tKey/diagnostic/excludedRCTs_review',
          review: tumor.diagnostic.excludedRCTs_review,
          lastReviewedString: '',
          uuid: tumor.diagnostic.excludedRCTs_uuid,
          reviewAction: ReviewAction.UPDATE,
        },
        historyData: {
          oldState: '',
          newState: 'Melanoma Subtype',
        },
      });

      await firebaseGeneReviewService.rejectChanges('BRAF', [reviewLevel], false);
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');

      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/diagnostic/excludedRCTs_review': {
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
        // Expect excludedRCTs to be cleared if rejecting initial update
        'Genes/BRAF/mutations/-mKey/tumors/-tKey/diagnostic/excludedRCTs': null,
        [`Meta/BRAF/review/${tumor.diagnostic.excludedRCTs_uuid}`]: null,
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
      });
    });

    it('should add alterations back to VUS list if promotion to mutation is rejected', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E, V600K';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User');
      mutation.name_review.promotedToMutation = true;
      const reviewLevel = new ReviewLevel({
        titleParts: ['V600E, V600K'],
        valuePath: 'mutations/-mKey/name',
        historyLocation: 'V600E, V600K',
        currentVal: 'V600E, V600K',
        reviewInfo: {
          reviewPath: 'mutations/-mKey/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.PROMOTE_VUS,
        },
        historyData: {
          oldState: mutation,
        },
        historyInfo: {},
      });
      await firebaseGeneReviewService.rejectChanges(hugoSymbol, [reviewLevel], false);

      // We expect both alterations (V600E and V600K) to be added to VUS list
      expect(mockFirebaseRepository.update.mock.calls[0][0]).toEqual('/');
      expect(mockFirebaseRepository.update.mock.calls[0][1]).toMatchObject({
        'Meta/BRAF/lastModifiedAt': DEFAULT_DATETIME_STRING,
        'Meta/BRAF/lastModifiedBy': mockAuthStore.fullName,
        [`Meta/BRAF/review/${mutation.name_uuid}`]: null,
        [`VUS/BRAF/${MOCKED_ARRAY_KEYS[0]}`]: {
          name: 'V600E',
        },
        [`VUS/BRAF/${MOCKED_ARRAY_KEYS[1]}`]: {
          name: 'V600K',
        },
      });
    });
  });
});
