import { GENE_TYPE, ReviewAction } from 'app/config/constants/firebase';
import {
  EditorReviewMap,
  MetaReviewLevel,
  ReviewLevel,
  ReviewLevelType,
  buildCancerTypeNameReview,
  buildNameReview,
  buildRCTReview,
  buildStringReview,
  clearAllNestedReviews,
  findReviewRecursive,
  findReviews,
  getRelevantKeysFromUuidKey,
  getReviewAction,
  joinPathParts,
  removeLeafNodes,
} from './firebase-review-utils';
import { Gene, GeneType, Implication, Mutation, Review, Treatment, Tumor } from 'app/shared/model/firebase/firebase.model';
import { DiffMethod } from 'react-diff-viewer-continued';
import { IDrug } from 'app/shared/model/drug.model';

describe('Firebase Review Utils', () => {
  describe('getRelevantKeysFromUuidKey', () => {
    it('should return correct keys', () => {
      expect(getRelevantKeysFromUuidKey('summary_uuid')).toStrictEqual({
        fieldKey: 'summary',
        reviewKey: 'summary_review',
        uuidKey: 'summary_uuid',
      });
    });
  });

  describe('joinPathParts', () => {
    it('should join path when parent path is empty', () => {
      expect(joinPathParts('', 'mutations', '0', 'name')).toEqual('mutations/0/name');
    });

    it('should join path', () => {
      expect(joinPathParts('gene', 'mutations', '0', 'name')).toEqual('gene/mutations/0/name');
    });
  });

  describe('getReviewAction', () => {
    test.each([
      [{ updatedBy: 'User', updateTime: 1 }, 'mutations/0/name_review', ReviewAction.NAME_CHANGE],
      [{ updatedBy: 'User', updateTime: 1 }, 'mutations/0/tumors/0/cancerTypes_review', ReviewAction.NAME_CHANGE],
      [{ updatedBy: 'User', updateTime: 1 }, 'mutations/0/tumors/0/TIs/0/treatments/0/name_review', ReviewAction.NAME_CHANGE],
      [{ updatedBy: 'User', updateTime: 1, promotedToMutation: true }, 'mutations/0/name_review', ReviewAction.PROMOTE_VUS],
      [{ updatedBy: 'User', updateTime: 1, added: true }, 'mutations/0/name_review', ReviewAction.CREATE],
      [{ updatedBy: 'User', updateTime: 1, demotedToVus: true }, 'mutations/0/name_review', ReviewAction.DEMOTE_MUTATION],
      [{ updatedBy: 'User', updateTime: 1, removed: true }, 'mutations/0/name_review', ReviewAction.DELETE],
      [{ updatedBy: 'User', updateTime: 1, lastReviewed: 'old' }, 'mutations/0/description_review', ReviewAction.UPDATE],
    ])('should return %i when review = %o, path = %s', (review, path, expected) => {
      const result = getReviewAction(review, path);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('buildStringReview', () => {
    let editorReviewMap: EditorReviewMap;
    let defaultParentReview;

    beforeEach(() => {
      editorReviewMap = new EditorReviewMap();
      defaultParentReview = new MetaReviewLevel({ title: '', valuePath: '', historyLocation: '' });
    });

    it('should return string review', () => {
      const gene = new Gene('BRAF');
      gene.background = 'test';
      gene.background_review = new Review('User', '');
      const uuids = [gene.background_uuid];

      const stringReview = buildStringReview(
        gene,
        '',
        { fieldKey: 'background', reviewKey: 'background_review', uuidKey: 'background_uuid' },
        defaultParentReview,
        uuids,
        editorReviewMap
      );

      const expectedValues = {
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
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedStringReview = new ReviewLevel(expectedValues);

      expect(stringReview).toStrictEqual(expectedStringReview);
    });

    it('should remove uuid and update editorReviewMap', () => {
      const geneType = new GeneType();
      geneType.ocg = GENE_TYPE.ONCOGENE;
      geneType.ocg_review = new Review('User', '');

      const uuids = [geneType.ocg_uuid];

      const stringReview = buildStringReview(
        geneType,
        'type',
        { fieldKey: 'ocg', reviewKey: 'ocg_review', uuidKey: 'ocg_uuid' },
        defaultParentReview,
        uuids,
        editorReviewMap
      );

      expect(uuids).toStrictEqual([]);
      expect(editorReviewMap.getEditorList()).toStrictEqual(['User']);
      expect(editorReviewMap.getReviewsByEditor('User')).toStrictEqual([stringReview]);
    });
  });

  describe('buildNameReview', () => {
    let editorReviewMap;
    let defaultParentReview;
    let defaultMutation;

    beforeEach(() => {
      editorReviewMap = new EditorReviewMap();
      defaultParentReview = new MetaReviewLevel({ title: '', valuePath: '', historyLocation: '' });
      defaultMutation = new Mutation('V600E');
    });

    it('should return only meta review if no name change', () => {
      const uuids = []; // UUIDs array is empty because no name change
      const metaReview = buildNameReview(defaultMutation, 'mutations/0', defaultParentReview, uuids, editorReviewMap);

      expect(metaReview.title).toEqual('V600E');
      expect(metaReview.valuePath).toEqual('mutations/0');
      expect(metaReview.historyLocation).toEqual('V600E');
      // Don't expect child because no name change
      expect(metaReview.hasChildren()).toBeFalsy();
    });

    it('should return name review if exists', () => {
      // Edit the mutation name
      defaultMutation.name = 'V600';
      defaultMutation.name_review = new Review('User', 'V600E');

      const uuids = [defaultMutation.name_uuid];
      const metaReview = buildNameReview(defaultMutation, 'mutations/0', defaultParentReview, uuids, editorReviewMap);

      // We expect the mutation meta review level to be created with correct values
      expect(metaReview.title).toEqual('V600');
      expect(metaReview.valuePath).toEqual('mutations/0');
      expect(metaReview.historyLocation).toEqual('V600');
      expect(metaReview.hasChildren()).toBeTruthy();

      // We expect the actual mutation name review level to be correct
      const expectedValues = {
        title: 'Name',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600',
        currentVal: 'V600',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: defaultMutation.name_review,
          lastReviewedString: 'V600E',
          uuid: defaultMutation.name_uuid,
          reviewAction: ReviewAction.NAME_CHANGE,
          diffMethod: DiffMethod.WORDS,
        },
        historyData: {
          oldState: 'V600E',
          newState: 'V600',
        },
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedNameReview = new ReviewLevel(expectedValues);

      const nameReview = metaReview.children['Name'] as ReviewLevel;
      expect(nameReview).toStrictEqual(expectedNameReview);
    });

    it('should detect added mutation', () => {
      defaultMutation.name_review = new Review('User', undefined, true);

      const uuids = [defaultMutation.name_uuid];
      const newMutationReview = buildNameReview(defaultMutation, 'mutations/0', defaultParentReview, uuids, editorReviewMap);

      const expectedValues = {
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: defaultMutation.name_review,
          lastReviewedString: undefined,
          uuid: defaultMutation.name_uuid,
          reviewAction: ReviewAction.CREATE,
          diffMethod: DiffMethod.WORDS,
        },
        historyData: {
          oldState: undefined,
          newState: defaultMutation,
        },
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedNameReview = new ReviewLevel(expectedValues);

      expect(newMutationReview).toStrictEqual(expectedNameReview);
    });

    it('should detect deleted mutation', () => {
      defaultMutation.name_review = new Review('User', undefined, undefined, true);

      const uuids = [defaultMutation.name_uuid];
      const newMutationReview = buildNameReview(defaultMutation, 'mutations/0', defaultParentReview, uuids, editorReviewMap);

      const expectedValues = {
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: defaultMutation.name_review,
          lastReviewedString: undefined,
          uuid: defaultMutation.name_uuid,
          reviewAction: ReviewAction.CREATE,
          diffMethod: DiffMethod.WORDS,
        },
        historyData: {
          oldState: defaultMutation,
          newState: undefined,
        },
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedNameReview = new ReviewLevel(expectedValues);

      expect(newMutationReview).toStrictEqual(expectedNameReview);
    });

    it('should remove uuid from list when there is a name change', () => {
      defaultMutation.name = 'V600';
      defaultMutation.name_review = new Review('User', 'V600E');
      const uuids = [defaultMutation.name_uuid];

      buildNameReview(defaultMutation, 'mutations/0', defaultParentReview, uuids, editorReviewMap);
      expect(uuids).toStrictEqual([]);
    });

    it('should use therapy name instead of uuid', () => {
      const drugAUuid = '79d0ee95-4482-4d5e-964e-85e2a50fc862';
      const drugBUuid = '335547ab-e985-4e30-8bef-c9009bfafc07';
      const drugList: readonly IDrug[] = [
        {
          name: 'DrugA',
          uuid: drugAUuid,
        },
        {
          name: 'DrugB',
          uuid: drugBUuid,
        },
      ];

      const parentReview = new MetaReviewLevel({
        title: 'V600E / Melanoma',
        valuePath: 'mutations/0/tumors/0',
        historyLocation: 'V600E, Melanoma',
      });
      const treatment = new Treatment(`${drugAUuid} + ${drugBUuid}`);
      treatment.name_review = new Review('User', undefined, true);
      const uuids = [treatment.name_uuid];

      const treatmentNameReview = buildNameReview(
        treatment,
        'mutations/0/tumors/0/TIs/0/treatments',
        parentReview,
        uuids,
        editorReviewMap,
        drugList
      );

      expect(treatmentNameReview.title).toEqual('DrugA + DrugB');
      expect(treatmentNameReview.historyLocation).toEqual('V600E, Melanoma, DrugA + DrugB');
    });
  });

  describe('buildCancerTypeNameReview', () => {
    let editorReviewMap;
    let defaultParentReview;
    let defaultTumor;

    beforeEach(() => {
      editorReviewMap = new EditorReviewMap();
      defaultParentReview = new MetaReviewLevel({ title: 'V600E', valuePath: 'mutations/0', historyLocation: 'V600E' });
      defaultTumor = new Tumor();
      defaultTumor.cancerTypes = [{ code: 'MEL', mainType: 'Melanoma', subtype: 'Melanoma' }];
    });

    it('should return only meta review when no name change', () => {
      const uuids = []; // UUIDs array is empty because no name change
      const metaReview = buildCancerTypeNameReview(defaultTumor, 'mutations/0/tumors/0', defaultParentReview, uuids, editorReviewMap);

      expect(metaReview.title).toEqual('Melanoma');
      expect(metaReview.valuePath).toEqual('mutations/0/tumors/0');
      expect(metaReview.historyLocation).toEqual('V600E, Melanoma');
      // Don't expect child because no name change
      expect(metaReview.hasChildren()).toBeFalsy();
    });

    it('should include excluded cancer types in name', () => {
      defaultTumor.excludedCancerTypes = [{ code: 'OM', mainType: 'Melanoma', subtype: 'Ocular Melanoma' }];
      const uuids = []; // UUIDs array is empty because no name change
      const metaReview = buildCancerTypeNameReview(defaultTumor, 'mutations/0/tumors/0', defaultParentReview, uuids, editorReviewMap);

      expect(metaReview.title).toEqual('Melanoma {excluding Ocular Melanoma}');
      expect(metaReview.valuePath).toEqual('mutations/0/tumors/0');
      expect(metaReview.historyLocation).toEqual('V600E, Melanoma {excluding Ocular Melanoma}');
      expect(metaReview.hasChildren()).toBeFalsy();
    });
  });

  describe('buildRCTReview', () => {
    let editorReviewMap;

    beforeEach(() => {
      editorReviewMap = new EditorReviewMap();
    });

    it('should return undefined when no changes were made', () => {
      const parentReview = new MetaReviewLevel({
        title: 'Melanoma',
        valuePath: 'mutations/0/tumors/0',
        historyLocation: 'V600E, Melanoma',
      });

      const implication = new Implication();
      const uuids = [];
      const rctReview = buildRCTReview(implication, parentReview, uuids, editorReviewMap);

      expect(rctReview).toBeUndefined();
    });

    it('should return RCT review for initial update', () => {
      const parentReview = new MetaReviewLevel({
        title: 'Melanoma',
        valuePath: 'mutations/0/tumors/0/prognostic',
        historyLocation: 'V600E, Melanoma, Prognostic',
      });

      const implication = new Implication();
      implication.excludedRCTs_review = new Review('User', undefined, undefined, undefined, true);
      implication.excludedRCTs = [{ code: 'OM', mainType: 'Melanoma', subtype: 'Ocular Melanoma' }];
      const uuids = [implication.excludedRCTs_uuid];

      const rctReview = buildRCTReview(implication, parentReview, uuids, editorReviewMap);

      expect(rctReview).toBeDefined();
      const expectedValues = {
        title: 'Relevant Cancer Types',
        valuePath: 'mutations/0/tumors/0/prognostic/excludedRCTs',
        historyLocation: 'V600E, Melanoma, Prognostic, Relevant Cancer Types',
        currentVal: 'Ocular Melanoma',
        reviewInfo: {
          reviewPath: 'mutations/0/tumors/0/prognostic/excludedRCTs_review',
          review: implication.excludedRCTs_review,
          lastReviewedString: '',
          uuid: implication.excludedRCTs_uuid,
          reviewAction: ReviewAction.UPDATE,
          diffMethod: DiffMethod.WORDS,
        },
        historyData: {
          oldState: '',
          newState: 'Ocular Melanoma',
        },
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedNameReview = new ReviewLevel(expectedValues);

      expect(rctReview).toStrictEqual(expectedNameReview);
    });

    it('should return RCT review when there are already excluded cancer types', () => {
      const parentReview = new MetaReviewLevel({
        title: 'Melanoma',
        valuePath: 'mutations/0/tumors/0/diagnostic',
        historyLocation: 'V600E, Melanoma, Diagnostic',
      });

      const oldExclusions = [{ code: 'UM', mainType: 'Melanoma', subtype: 'Uveal Melanoma' }];
      const newExclusions = [{ code: 'OM', mainType: 'Melanoma', subtype: 'Ocular Melanoma' }, ...oldExclusions];

      const implication = new Implication();
      // There is already an excluded CT
      implication.excludedRCTs_review = new Review('User', oldExclusions);
      implication.excludedRCTs = newExclusions;
      const uuids = [implication.excludedRCTs_uuid];

      const rctReview = buildRCTReview(implication, parentReview, uuids, editorReviewMap);

      expect(rctReview).toBeDefined();
      const expectedValues = {
        title: 'Relevant Cancer Types',
        valuePath: 'mutations/0/tumors/0/diagnostic/excludedRCTs',
        historyLocation: 'V600E, Melanoma, Diagnostic, Relevant Cancer Types',
        currentVal: 'Ocular Melanoma\tUveal Melanoma',
        reviewInfo: {
          reviewPath: 'mutations/0/tumors/0/diagnostic/excludedRCTs_review',
          review: implication.excludedRCTs_review,
          lastReviewedString: 'Uveal Melanoma',
          uuid: implication.excludedRCTs_uuid,
          reviewAction: ReviewAction.UPDATE,
          diffMethod: DiffMethod.WORDS,
        },
        historyData: {
          oldState: 'Uveal Melanoma',
          newState: 'Ocular Melanoma\tUveal Melanoma',
        },
        reviewLevelType: ReviewLevelType.REVIEWABLE,
      };
      const expectedNameReview = new ReviewLevel(expectedValues);

      expect(rctReview).toStrictEqual(expectedNameReview);
    });
  });

  describe('findReviewRecursive', () => {
    describe('find all reviews in gene object', () => {
      let parentReview: MetaReviewLevel;
      let editorReviewMap;
      let gene: Gene;
      let mutation: Mutation;
      let uuids: string[];
      let drugList: readonly IDrug[];
      beforeEach(() => {
        uuids = [];
        parentReview = new MetaReviewLevel({ title: '', valuePath: '', historyLocation: '' });
        editorReviewMap = new EditorReviewMap();
        drugList = [];

        gene = new Gene('BRAF');
        gene.background = 'new background';
        gene.background_review = new Review('User', 'new background');
        uuids.push(gene.background_uuid);

        mutation = new Mutation('V600E');
        gene.mutations.push(mutation);
        mutation.mutation_effect.description = 'new description';
        mutation.mutation_effect.description_review = new Review('User2', 'old description');
        uuids.push(mutation.mutation_effect.description_uuid);
      });

      it('should return all reviews', () => {
        findReviewRecursive(gene, '', uuids, parentReview, editorReviewMap, drugList);

        const expectedReview = {
          reviewLevelType: 0,
          title: '',
          valuePath: '',
          historyLocation: '',
          nestedUnderCreateOrDelete: false,
          children: {
            Background: {
              reviewLevelType: 1,
              title: 'Background',
              valuePath: 'background',
              historyLocation: 'Background',
              nestedUnderCreateOrDelete: false,
              children: {},
              currentVal: 'new background',
              reviewInfo: {
                reviewPath: 'background_review',
                review: gene.background_review,
                lastReviewedString: 'new background',
                uuid: gene.background_uuid,
                diffMethod: DiffMethod.CHARS,
                reviewAction: ReviewAction.UPDATE,
              },
              historyData: { oldState: 'new background', newState: 'new background' },
            },
            V600E: {
              reviewLevelType: 0,
              title: 'V600E',
              valuePath: 'mutations/0',
              historyLocation: 'V600E',
              nestedUnderCreateOrDelete: false,
              children: {
                'Mutation Effect': {
                  reviewLevelType: 0,
                  title: 'Mutation Effect',
                  valuePath: 'mutations/0/mutation_effect',
                  historyLocation: 'V600E, Mutation Effect',
                  nestedUnderCreateOrDelete: false,
                  children: {
                    Description: {
                      reviewLevelType: 1,
                      title: 'Description',
                      valuePath: 'mutations/0/mutation_effect/description',
                      historyLocation: 'V600E, Mutation Effect, Description',
                      nestedUnderCreateOrDelete: false,
                      children: {},
                      currentVal: 'new description',
                      reviewInfo: {
                        reviewPath: 'mutations/0/mutation_effect/description_review',
                        review: mutation.mutation_effect.description_review,
                        lastReviewedString: 'old description',
                        uuid: mutation.mutation_effect.description_uuid,
                        diffMethod: DiffMethod.CHARS,
                        reviewAction: ReviewAction.UPDATE,
                      },
                      historyData: { oldState: 'old description', newState: 'new description' },
                    },
                  },
                },
              },
            },
          },
        };

        expect(parentReview).toEqual(expect.objectContaining(expectedReview));
      });
    });
  });

  describe('clearAllNestedReviews', () => {
    describe('delete all review keys', () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));
      test.each([
        [{ key_review: new Review('User', 'old value') }, { key_review: new Review('User') }],
        [{ key_review: new Review('User', undefined, true) }, { key_review: new Review('User') }],
        [{ key_review: new Review('User', undefined, undefined, true) }, { key_review: new Review('User') }],
        [{ key_review: new Review('User', undefined, undefined, undefined, true) }, { key_review: new Review('User') }],
      ])('should delete all review keys', (obj, expected) => {
        clearAllNestedReviews(obj);
        expect(obj).toStrictEqual(expected);
      });
    });
  });

  describe('removeLeafNodes', () => {
    let parentReview: MetaReviewLevel;

    beforeEach(() => {
      parentReview = new MetaReviewLevel({ title: '', valuePath: '', historyLocation: '' });
    });

    it('should keep parentReview unchanged if no children', () => {
      removeLeafNodes(parentReview);
      const expectedReview = {
        title: '',
        valuePath: '',
        historyLocation: '',
      };
      expect(parentReview).toEqual(expect.objectContaining(expectedReview));
    });

    it('should remove meta review level with no children', () => {
      const metaReview = new MetaReviewLevel({ title: 'V600E', valuePath: 'mutations/0', historyLocation: 'V600E' });
      parentReview.addChild(metaReview);
      removeLeafNodes(parentReview);
      expect(parentReview.hasChildren()).toBeFalsy;
    });

    it('should remove review level if review action is create', () => {
      const reviewLevel = new ReviewLevel({
        title: 'V600E',
        valuePath: 'mutations/0/name',
        historyLocation: 'V600E',
        currentVal: 'V600E',
        reviewInfo: {
          reviewPath: 'mutations/0/name_review',
          review: new Review('User', undefined, true),
          lastReviewedString: '',
          uuid: 'uuid',
        },
        historyData: { newState: 'V600E' },
      });
      parentReview.addChild(reviewLevel);

      removeLeafNodes(parentReview);
      expect(parentReview.hasChildren()).toBeFalsy();
    });
  });
});
