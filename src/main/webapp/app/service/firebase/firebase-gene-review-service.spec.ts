import { FirebaseGeneReviewService } from './firebase-gene-review-service';
import { FirebaseRepository } from 'app/stores/firebase/firebase-repository';
import { AuthStore } from 'app/stores';
import { FirebaseMetaService } from './firebase-meta-service';
import { FirebaseHistoryService } from './firebase-history-service';
import { FirebaseVusService } from './firebase-vus-service';
import { Gene, Mutation, Review } from 'app/shared/model/firebase/firebase.model';
import { mock, mockReset } from 'jest-mock-extended';
import { SentryError } from 'app/config/sentry-error';
import { ReviewLevel } from 'app/shared/util/firebase/firebase-review-utils';
import { ReviewAction } from 'app/config/constants/firebase';
import { DiffMethod } from 'react-diff-viewer-continued';
import _ from 'lodash';

describe('Firebase Gene Review Service', () => {
  const DEFAULT_USERNAME = 'Test User';
  const DEFAULT_DATE = new Date('2023-01-01');
  const mockFirebaseRepository = mock<FirebaseRepository>();
  const mockAuthStore = mock<AuthStore>();
  const mockMetaService = mock<FirebaseMetaService>();
  const mockHistoryService = mock<FirebaseHistoryService>();
  const mockVusService = mock<FirebaseVusService>();
  let firebaseGeneReviewService: FirebaseGeneReviewService;

  const _beforeEach = () => {
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
  };

  beforeEach(_beforeEach);

  describe('updateReviewableContent', () => {
    it('should update to firebase path with correct object', async () => {
      await firebaseGeneReviewService.updateReviewableContent(
        'Genes/BRAF/mutations/0/description',
        'old',
        'new',
        new Review(DEFAULT_USERNAME),
        'uuid',
      );

      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Genes/BRAF', {
        'mutations/0/description': 'new',
        'mutations/0/description_review': {
          lastReviewed: 'old',
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
      });
    });

    it('should update germline content', async () => {
      await firebaseGeneReviewService.updateReviewableContent(
        'Germline_Genes/BRAF/summary',
        'old',
        'new',
        new Review(DEFAULT_USERNAME),
        'uuid',
      );

      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Germline_Genes/BRAF', {
        summary: 'new',
        summary_review: {
          lastReviewed: 'old',
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: mockAuthStore.fullName,
        },
      });
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
      gene.background_review = new Review('User', '');

      const reviewLevel = new ReviewLevel({
        title: 'Background',
        valuePath: 'background',
        historyLocation: 'Background',
        currentVal: 'test',
        reviewInfo: {
          reviewPath: 'background_review',
          review: gene.background_review,
          lastReviewedString: '',
          uuid: gene.background_uuid,
          reviewAction: ReviewAction.UPDATE,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: '',
          newState: 'test',
        },
      });

      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);

      expect(mockHistoryService.addHistory).toHaveBeenCalled();
      // We expect the lastReviewed to be cleared when accepting changes
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Genes/BRAF', {
        background_review: {
          updateTime: DEFAULT_DATE.getTime(),
          updatedBy: 'User',
        },
      });
      // We also expect the uuid to be removed from the META collection
      expect(mockMetaService.updateGeneReviewUuid).toHaveBeenCalledWith(hugoSymbol, gene.background_uuid, false, false);
    });

    it('should delete from array when accepting deletion', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, undefined, true);

      const reviewLevel = new ReviewLevel({
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DELETE,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: mutation,
        },
      });

      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);

      expect(mockHistoryService.addHistory).toHaveBeenCalled();
      expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [0]);
      expect(mockMetaService.updateGeneReviewUuid).toHaveBeenCalledWith(hugoSymbol, mutation.name_uuid, false, false);
      expect(mockVusService.addVus).not.toHaveBeenCalled();
    });

    it('should add alterations to VUS collection when demoting a mutation', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E, V600K';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User');
      mutation.name_review.demotedToVus = true;

      const reviewLevel = new ReviewLevel({
        title: 'V600E, V600K',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E, V600K',
        currentVal: 'V600E, V600K',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DEMOTE_MUTATION,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: mutation,
        },
      });

      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);

      expect(mockHistoryService.addHistory).toHaveBeenCalled();
      expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [0]);
      expect(mockMetaService.updateGeneReviewUuid).toHaveBeenCalledWith(hugoSymbol, mutation.name_uuid, false, false);
      // We expect both alterations (V600E and V600K) to be added to VUS list
      expect(mockVusService.addVus).toHaveBeenCalledWith('VUS/BRAF', ['V600E', 'V600K']);
    });

    it('should accept newly created entity', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, true);

      const reviewLevel = new ReviewLevel({
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.CREATE,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          newState: mutation,
        },
      });

      await firebaseGeneReviewService.acceptChanges(hugoSymbol, [reviewLevel], false);

      const expectedMutation = _.cloneDeep(mutation);
      delete expectedMutation.name_review.added;

      expect(mockHistoryService.addHistory).toHaveBeenCalled();
      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Genes/BRAF', { 'mutations/0': expectedMutation });
    });
  });

  describe('rejectChanges', () => {
    it('should delete lastReviewed and set value back to lastReviewed when rejecting update', async () => {
      const hugoSymbol = 'BRAF';
      const gene = new Gene(hugoSymbol);
      gene.background = 'test';
      gene.background_review = new Review('User', '');

      const reviewLevel = new ReviewLevel({
        title: 'Background',
        valuePath: 'background',
        historyLocation: 'Background',
        currentVal: 'test',
        reviewInfo: {
          reviewPath: 'background_review',
          review: gene.background_review,
          lastReviewedString: '',
          uuid: gene.background_uuid,
          reviewAction: ReviewAction.UPDATE,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: '',
          newState: 'test',
        },
      });

      await firebaseGeneReviewService.rejectChanges(hugoSymbol, reviewLevel, false);

      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Genes/BRAF', {
        background: '',
        background_review: { updateTime: DEFAULT_DATE.getTime(), updatedBy: mockAuthStore.fullName },
      });
      expect(mockMetaService.updateMeta).toHaveBeenCalledWith('BRAF', gene.background_uuid, false, false);
    });

    it('should clear review object when rejecting a deletion', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User', undefined, undefined, true);

      const reviewLevel = new ReviewLevel({
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.DELETE,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: mutation,
        },
      });

      await firebaseGeneReviewService.rejectChanges(hugoSymbol, reviewLevel, false);

      expect(mockFirebaseRepository.update).toHaveBeenCalledWith('Genes/BRAF', {
        'mutations/0/name_review': { updateTime: DEFAULT_DATE.getTime(), updatedBy: mockAuthStore.fullName },
      });
      expect(mockMetaService.updateMeta).toHaveBeenCalledWith('BRAF', mutation.name_uuid, false, false);
    });

    it('should add alterations back to VUS list if promotion to mutation is rejected', async () => {
      const hugoSymbol = 'BRAF';
      const mutationName = 'V600E, V600K';
      const mutation = new Mutation(mutationName);
      mutation.name_review = new Review('User');
      mutation.name_review.promotedToMutation = true;

      const reviewLevel = new ReviewLevel({
        title: 'V600E, V600K',
        valuePath: 'mutations/12/name',
        historyLocation: 'V600E, V600K',
        currentVal: 'V600E, V600K',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: mutation.name_review,
          lastReviewedString: undefined,
          uuid: mutation.name_uuid,
          reviewAction: ReviewAction.PROMOTE_VUS,
          diffMethod: DiffMethod.CHARS,
        },
        historyData: {
          oldState: mutation,
        },
      });

      await firebaseGeneReviewService.rejectChanges(hugoSymbol, reviewLevel, false);

      expect(mockFirebaseRepository.deleteFromArray).toHaveBeenCalledWith('Genes/BRAF/mutations', [12]);
      // We expect both alterations (V600E and V600K) to be added back to VUS list
      expect(mockVusService.addVus).toHaveBeenCalledWith('VUS/BRAF', ['V600E', 'V600K']);
    });
  });
});
