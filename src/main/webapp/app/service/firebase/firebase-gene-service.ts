import {
  CancerTypeList,
  DX_LEVELS,
  DrugCollection,
  FIREBASE_ONCOGENICITY,
  Gene,
  GenomicIndicator,
  Mutation,
  MutationList,
  PX_LEVELS,
  Review,
  TX_LEVELS,
  Treatment,
  Tumor,
  Vus,
} from 'app/shared/model/firebase/firebase.model';
import { isTxLevelPresent } from 'app/shared/util/firebase/firebase-level-utils';
import { extractArrayPath, parseFirebaseGenePath } from 'app/shared/util/firebase/firebase-path-utils';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import {
  findNestedUuids,
  getFirebaseGenePath,
  getFirebaseVusPath,
  isSectionRemovableWithoutReview,
} from 'app/shared/util/firebase/firebase-utils';
import AuthStore from '../../stores/authentication.store';
import { FirebaseRepository } from '../../stores/firebase/firebase-repository';
import { FirebaseMetaService } from './firebase-meta-service';
import { PATHOGENIC_VARIANTS } from 'app/config/constants/firebase';
import { generateUuid, isPromiseOk } from 'app/shared/util/utils';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { getErrorMessage } from 'app/oncokb-commons/components/alert/ErrorAlertUtils';
import { FirebaseDataStore } from 'app/stores/firebase/firebase-data.store';
import { getTumorNameUuid, getUpdatedReview } from 'app/shared/util/firebase/firebase-review-utils';
import { SentryError } from 'app/config/sentry-error';
import {
  GERMLINE_INHERITANCE_MECHANISM,
  GERMLINE_PATH,
  GET_ALL_DRUGS_PAGE_SIZE,
  NEW_NAME_UUID_VALUE,
} from 'app/config/constants/constants';
import _ from 'lodash';
import { getDriveAnnotations } from 'app/shared/util/core-drive-annotation-submission/core-drive-annotation-submission';
import { DriveAnnotationApi } from 'app/shared/api/manual/drive-annotation-api';
import GeneStore from 'app/entities/gene/gene.store';
import { geneIsReleased } from 'app/shared/util/entity-utils/gene-entity-utils';
import DrugStore from 'app/entities/drug/drug.store';
import { flow, flowResult } from 'mobx';
import axios, { AxiosResponse } from 'axios';
import { IGene } from 'app/shared/model/gene.model';

export type AllLevelSummary = {
  [mutationUuid: string]: {
    [cancerTypesUuid: string]: {
      TT: number;
      oncogenicity: FIREBASE_ONCOGENICITY | '';
      TTS: number;
      DxS: number;
      PxS: number;
      txLevels: TX_LEVELS[];
      dxLevels: DX_LEVELS[];
      pxLevels: PX_LEVELS[];
      treatmentSummary: { [treatmentId: string]: TX_LEVELS[] };
    };
  };
};

export type MutationLevelSummary = {
  [mutationUuid: string]: {
    TT: number;
    oncogenicity: FIREBASE_ONCOGENICITY | '';
    mutationEffect: string;
    TTS: number;
    DxS: number;
    PxS: number;
    txLevels: { [txLevel in TX_LEVELS]: number };
    dxLevels: { [dxLevel in DX_LEVELS]: number };
    pxLevels: { [pxLevel in PX_LEVELS]: number };
  };
};

export class FirebaseGeneService {
  firebaseRepository: FirebaseRepository;
  authStore: AuthStore;
  geneStore: GeneStore;
  drugStore: DrugStore;
  firebaseMutationListStore: FirebaseDataStore<MutationList>;
  firebaseMutationConvertIconStore: FirebaseDataStore<MutationList>;
  firebaseMetaService: FirebaseMetaService;
  firebaseGeneReviewService: FirebaseGeneReviewService;
  driveAnnotationApi: DriveAnnotationApi;

  constructor(
    firebaseRepository: FirebaseRepository,
    authStore: AuthStore,
    geneStore: GeneStore,
    drugStore: DrugStore,
    firebaseMutationListStore: FirebaseDataStore<MutationList>,
    firebaseMutationConvertIconStore: FirebaseDataStore<MutationList>,
    firebaseMetaService: FirebaseMetaService,
    firebaseGeneReviewService: FirebaseGeneReviewService,
    driveAnnotationApi: DriveAnnotationApi,
  ) {
    this.firebaseRepository = firebaseRepository;
    this.authStore = authStore;
    this.geneStore = geneStore;
    this.drugStore = drugStore;
    this.firebaseMutationListStore = firebaseMutationListStore;
    this.firebaseMutationConvertIconStore = firebaseMutationConvertIconStore;
    this.firebaseMetaService = firebaseMetaService;
    this.firebaseGeneReviewService = firebaseGeneReviewService;
    this.driveAnnotationApi = driveAnnotationApi;
  }

  getAllLevelMutationSummaryStats = (mutations: MutationList) => {
    const summary: AllLevelSummary = {};
    if (mutations) {
      Object.values(mutations).forEach(mutation => {
        summary[mutation.name_uuid] = {};
        if (mutation.tumors) {
          Object.values(mutation.tumors).forEach(tumor => {
            summary[mutation.name_uuid][tumor.cancerTypes_uuid] = {
              TT: 0,
              oncogenicity: '',
              TTS: 0,
              DxS: 0,
              PxS: 0,
              txLevels: [],
              dxLevels: [],
              pxLevels: [],
              treatmentSummary: {},
            };
            summary[mutation.name_uuid][tumor.cancerTypes_uuid].TT++;
            summary[mutation.name_uuid][tumor.cancerTypes_uuid].oncogenicity = mutation.mutation_effect.oncogenic;
            if (tumor.summary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].TTS++;
            }
            if (tumor.diagnosticSummary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].DxS++;
            }
            if (tumor.prognosticSummary) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].PxS++;
            }
            tumor.TIs.forEach(ti => {
              if (ti.treatments) {
                Object.values(ti.treatments).forEach(treatment => {
                  const cancerTypeSummary = summary[mutation.name_uuid][tumor.cancerTypes_uuid];
                  cancerTypeSummary.txLevels.push(treatment.level);

                  if (!cancerTypeSummary.treatmentSummary[treatment.name_uuid]) {
                    cancerTypeSummary.treatmentSummary[treatment.name_uuid] = [];
                  }
                  cancerTypeSummary.treatmentSummary[treatment.name_uuid].push(treatment.level);
                });
              }
            });
            if (tumor?.diagnostic?.level) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].dxLevels.push(tumor.diagnostic.level as DX_LEVELS);
            }
            if (tumor?.prognostic?.level) {
              summary[mutation.name_uuid][tumor.cancerTypes_uuid].pxLevels.push(tumor.prognostic.level as PX_LEVELS);
            }
          });
        }
      });
    }
    return summary;
  };

  getMutationLevelMutationSummaryStats = (mutations: MutationList) => {
    const summary: MutationLevelSummary = {};
    if (mutations) {
      Object.values(mutations).forEach(mutation => {
        summary[mutation.name_uuid] = {
          TT: 0,
          oncogenicity: mutation.mutation_effect.oncogenic,
          mutationEffect: mutation.mutation_effect.effect,
          TTS: 0,
          DxS: 0,
          PxS: 0,
          txLevels: {} as { [txLevel in TX_LEVELS]: number },
          dxLevels: {} as { [dxLevel in DX_LEVELS]: number },
          pxLevels: {} as { [pxLevel in PX_LEVELS]: number },
        };
        if (mutation.tumors) {
          Object.values(mutation.tumors).forEach(tumor => {
            summary[mutation.name_uuid].TT++;
            if (tumor.summary) {
              summary[mutation.name_uuid].TTS++;
            }
            if (tumor.diagnosticSummary) {
              summary[mutation.name_uuid].DxS++;
            }
            if (tumor.prognosticSummary) {
              summary[mutation.name_uuid].PxS++;
            }
            tumor.TIs.forEach(ti => {
              if (ti.treatments) {
                Object.values(ti.treatments).forEach(treatment => {
                  if (isTxLevelPresent(treatment.level)) {
                    if (!summary[mutation.name_uuid].txLevels[treatment.level]) {
                      summary[mutation.name_uuid].txLevels[treatment.level] = 1;
                    } else {
                      summary[mutation.name_uuid].txLevels[treatment.level]++;
                    }
                  }
                });
              }
            });
            if (tumor?.diagnostic?.level) {
              if (!summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level]) {
                summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level] = 1;
              } else {
                summary[mutation.name_uuid].dxLevels[tumor.diagnostic.level]++;
              }
            }
            if (tumor?.prognostic?.level) {
              if (!summary[mutation.name_uuid].dxLevels[tumor.prognostic.level]) {
                summary[mutation.name_uuid].dxLevels[tumor.prognostic.level] = 1;
              } else {
                summary[mutation.name_uuid].dxLevels[tumor.prognostic.level]++;
              }
            }
          });
        }
      });
    }
    return summary;
  };

  deleteSection = async (
    path: string,
    sectionObject: Mutation | Tumor | Treatment | GenomicIndicator,
    review: Review | null | undefined,
    uuid: string,
    isDemotedToVus = false,
  ) => {
    const isGermline = path.toLowerCase().includes(GERMLINE_PATH);
    const name = this.authStore.fullName;
    const pathDetails = parseFirebaseGenePath(path);
    if (pathDetails === undefined) {
      return Promise.reject(new Error('Cannot parse firebase gene path'));
    }
    const hugoSymbol = pathDetails.hugoSymbol;
    const pathFromGene = pathDetails.pathFromGene;

    // Check if section can be removed immediately
    const removeWithoutReview = isSectionRemovableWithoutReview(review);

    review = new Review(name, undefined, undefined, true);
    if (isDemotedToVus) {
      review.demotedToVus = true;
    }

    let updateObject = {};
    if (removeWithoutReview) {
      const { firebaseArrayPath, deleteArrayKey } = extractArrayPath(path);
      const nestedUuids = findNestedUuids(sectionObject);
      const deleteArrayReturnVal = await this.firebaseRepository.deleteFromArray(firebaseArrayPath, [deleteArrayKey], false);
      if (deleteArrayReturnVal !== undefined) {
        updateObject = { ...updateObject, ...deleteArrayReturnVal.updateObject };
      }
      for (const id of [...nestedUuids, uuid]) {
        updateObject = { ...updateObject, ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [id]: null }) };
      }
    } else {
      updateObject = {
        ...updateObject,
        [`${getFirebaseGenePath(isGermline, hugoSymbol)}/${pathFromGene}_review`]: review,
        ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [uuid]: true }),
      };
    }

    try {
      await this.firebaseRepository.update('/', updateObject);
    } catch (e) {
      throw new SentryError('Failed to delete section', { updateObject, path, sectionObject, review, uuid, isDemotedToVus });
    }
  };

  createGene = async (hugoSymbol: string, isGermline: boolean, routeAfter?: string) => {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const results = await Promise.all([
      isPromiseOk(this.firebaseRepository.create(genePath, new Gene(hugoSymbol))),
      isPromiseOk(this.firebaseMetaService.createMetaGene(hugoSymbol, isGermline)),
    ]);

    if (results[0].ok && results[1].ok) {
      // both succeeded
      if (routeAfter) {
        window.location.href = routeAfter;
      }
    } else if (results[0].ok && !results[1].ok) {
      // createMetaGene failed
      notifyError(results[1].error);
      this.deleteObject(genePath);
    } else if (results[1].ok && !results[0].ok) {
      // createGene failed
      notifyError(results[0].error);
      this.firebaseMetaService.deleteMetaGene(hugoSymbol, isGermline);
    } else {
      // both failed
      notifyError(new Error(`Errors: ${getErrorMessage(results[0].error as Error)}, ${getErrorMessage(results[1].error as Error)}`));
    }
  };

  addTumor = async (tumorPath: string, newTumor: Tumor, isGermline: boolean) => {
    const { hugoSymbol } = parseFirebaseGenePath(tumorPath) ?? {};
    const name = this.authStore.fullName;
    newTumor.cancerTypes_review = new Review(name, undefined, true, undefined);

    if (!newTumor.excludedCancerTypes_uuid) {
      newTumor.excludedCancerTypes_uuid = generateUuid();
    }

    const tumorNameUuid = getTumorNameUuid(newTumor.cancerTypes_uuid, newTumor.excludedCancerTypes_uuid);

    if (hugoSymbol === undefined) {
      throw new SentryError('Could not resolve hugoSymbol', { tumorPath });
    }

    let updateObject = { ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [tumorNameUuid]: NEW_NAME_UUID_VALUE }) };
    const pushResult = await this.firebaseRepository.push(tumorPath, newTumor, false);
    if (pushResult !== undefined) {
      updateObject = { ...updateObject, ...pushResult.pushUpdateObject };
    }
    return this.firebaseRepository.update('/', updateObject);
  };

  updateTumorName = async (
    tumorPath: string,
    currentCancerTypes: CancerTypeList | undefined,
    currentExcludedCancerTypes: CancerTypeList | undefined,
    tumor: Tumor,
    isGermline: boolean,
  ) => {
    const cancerTypesReview = getUpdatedReview(
      tumor.cancerTypes_review,
      currentCancerTypes,
      tumor.cancerTypes,
      this.authStore.fullName,
      true,
      true,
    );
    const excludedCancerTypesReview = getUpdatedReview(
      tumor.excludedCancerTypes_review,
      currentExcludedCancerTypes,
      tumor.excludedCancerTypes,
      this.authStore.fullName,
      true,
      true,
    );

    tumor.cancerTypes_review = cancerTypesReview.updatedReview ?? undefined;
    tumor.excludedCancerTypes_review = excludedCancerTypesReview.updatedReview ?? undefined;

    if (!tumor.excludedCancerTypes_uuid) {
      tumor.excludedCancerTypes_uuid = generateUuid();
    }

    const isChangeReverted = cancerTypesReview.isChangeReverted || excludedCancerTypesReview.isChangeReverted;
    // The legacy platform combines the uuid of cancerTypes and excludedCancerTypes in review mode.
    // To maintain compatibility, we will do the same here.
    const tumorNameUuid = getTumorNameUuid(tumor.cancerTypes_uuid, tumor.excludedCancerTypes_uuid);

    const { hugoSymbol } = parseFirebaseGenePath(tumorPath) ?? {};

    // Not every tumor name may have excluded tumors. We add initialUpdate flag in this case
    // so that review mode can pick up.
    if (_.isNil(currentExcludedCancerTypes) && tumor.excludedCancerTypes_review) {
      tumor.excludedCancerTypes_review.initialUpdate = true;
    }

    return this.firebaseRepository.update(tumorPath, tumor).then(() => {
      if (cancerTypesReview.isChangeReverted) {
        this.firebaseRepository.delete(`${tumorPath}/cancerTypes_review/lastReviewed`);
      }
      if (excludedCancerTypesReview.isChangeReverted) {
        this.firebaseRepository.delete(`${tumorPath}/excludedCancerTypes_review/lastReviewed`);
      }
      if (hugoSymbol !== undefined) {
        this.firebaseMetaService.updateGeneMetaContent(hugoSymbol, isGermline);
        this.firebaseMetaService.updateGeneReviewUuid(hugoSymbol, tumorNameUuid, !isChangeReverted, isGermline);
      }
    });
  };

  updateTreatmentName = async (treatmentPath: string, currentTreatmentName: string, treatment: Treatment, isGermline: boolean) => {
    return this.firebaseRepository.update(treatmentPath, treatment).then(() => {
      this.firebaseGeneReviewService.updateReviewableContent(
        `${treatmentPath}/name`,
        currentTreatmentName,
        treatment.name,
        treatment.name_review,
        treatment.name_uuid,
      );
    });
  };

  addTreatment = async (treatmentPath: string, newTreatment: Treatment, isGermline: boolean) => {
    const { hugoSymbol } = parseFirebaseGenePath(treatmentPath) ?? {};
    const name = this.authStore.fullName;
    newTreatment.name_review = new Review(name, undefined, true, undefined);

    if (hugoSymbol !== undefined) {
      let updateObject = {
        ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [newTreatment.name_uuid]: NEW_NAME_UUID_VALUE }),
      };
      const pushResult = await this.firebaseRepository.push(treatmentPath, newTreatment, false);
      if (pushResult !== undefined) {
        updateObject = { ...updateObject, ...pushResult.pushUpdateObject };
      }
      return this.firebaseRepository.update('/', updateObject);
    }
  };

  updateMutationName = async (mutationPath: string, allMutationsPath: string, currentMutationName: string, mutation: Mutation) => {
    let { name_review } = mutation;
    let mutationToUpdate = mutation;

    if (!name_review) {
      name_review = new Review(this.authStore.fullName);

      mutationToUpdate = {
        ...mutation,
        name_review,
      };
    }
    await this.firebaseRepository.update(mutationPath, mutationToUpdate).then(() => {
      this.firebaseGeneReviewService.updateReviewableContent(
        `${mutationPath}/name`,
        currentMutationName,
        mutationToUpdate.name,
        name_review,
        mutationToUpdate.name_uuid,
      );
    });

    await this.firebaseMutationConvertIconStore.fetchData(allMutationsPath);
  };

  /**
   * The method is designed to be used only when adding a new mutation with name specified.
   * You could expect all data be saved, however, only the name uuid will be added into meta collection
   * and is only subject to be reviewed when other props' uuid within the Mutation model will be added later.
   *
   * @param mutationsPath The path to the mutations list
   * @param newMutation firebase Mutation model
   * @param isGermline  true/false to be added into Germline_Gene or Gene collections
   * @param isPromotedToMutation  will be used if the mutation is promoted from the VUS table
   * @param mutationEffectDescription description under the mutation_effect prop
   * @returns returns the firebase key of the new mutation
   */
  addMutation = async (
    mutationsPath: string,
    newMutation: Mutation,
    isGermline: boolean,
    isPromotedToMutation = false,
    mutationEffectDescription?: string,
  ) => {
    let pushResult: Awaited<ReturnType<typeof this.firebaseRepository.push>> = undefined;
    const { hugoSymbol } = parseFirebaseGenePath(mutationsPath) ?? {};
    const name = this.authStore.fullName;
    newMutation.name_review = new Review(name, undefined, true, undefined);
    if (isPromotedToMutation) {
      newMutation.name_review.promotedToMutation = true;
    }
    if (mutationEffectDescription) {
      newMutation.mutation_effect.description = mutationEffectDescription;
      newMutation.mutation_effect.description_review = new Review(name, '');
    }

    if (hugoSymbol !== undefined) {
      let updateObject = {
        ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [newMutation.name_uuid]: NEW_NAME_UUID_VALUE }),
      };
      if (mutationEffectDescription) {
        updateObject = {
          ...updateObject,
          ...this.firebaseMetaService.getUpdateObject(hugoSymbol, isGermline, { [newMutation.mutation_effect.description_uuid]: true }),
        };
      }

      pushResult = await this.firebaseRepository.push(mutationsPath, newMutation, false);
      if (pushResult !== undefined) {
        updateObject = { ...updateObject, ...pushResult.pushUpdateObject };
      } else {
        throw new SentryError('Failed to push to firebase array', {
          mutationsPath,
          newMutation,
          isGermline,
          isPromotedToMutation,
          mutationEffectDescription,
        });
      }

      // Inserting at root with multi-location updates ensures that all collections
      // are updating in a transactional manner
      await this.firebaseRepository.update('/', updateObject);
    }

    await this.firebaseMutationConvertIconStore.fetchData(mutationsPath);
    return pushResult ? pushResult.pushKey : null;
  };

  updateRelevantCancerTypes = async (
    rctPath: string,
    currentRelevantCancerTypes: CancerTypeList,
    newRelevantCancerTypes: CancerTypeList,
    review: Review,
    uuid: string | undefined,
    isGermline: boolean,
    initialUpdate?: boolean,
  ) => {
    const { hugoSymbol } = parseFirebaseGenePath(rctPath) ?? {};

    let updateObject = {};

    if (!uuid) {
      // excludedRCTs is a new data point that does not exist for implications created in legacy platform.
      // We will backfill the uuid
      uuid = generateUuid();
    }

    if (initialUpdate) {
      updateObject[rctPath] = newRelevantCancerTypes;
      updateObject[`${rctPath}_review`] = new Review(this.authStore.fullName, undefined, undefined, undefined, true);
      updateObject[`${rctPath}_uuid`] = uuid;
      const metaUpdateObject = this.firebaseMetaService.getUpdateObject(hugoSymbol!, isGermline, { [uuid]: true });
      updateObject = { ...updateObject, ...metaUpdateObject };
    } else {
      const rctUpdateObject = await this.firebaseGeneReviewService.updateReviewableContent(
        rctPath,
        currentRelevantCancerTypes || {},
        newRelevantCancerTypes,
        review,
        uuid,
        true,
        false,
      );
      updateObject = { ...updateObject, ...rctUpdateObject };
    }

    try {
      await this.firebaseRepository.update('/', updateObject);
    } catch (error) {
      throw new SentryError('Failed to update RCT', { rctPath, initialUpdate, updateObject });
    }
  };

  addEmptyGenomicIndicator = async (genomicIndicatorsPath: string) => {
    await this.addGenomicIndicator(false, genomicIndicatorsPath, '');
  };

  addGenomicIndicator = async (
    toReview: boolean,
    genomicIndicatorsPath: string,
    name: string,
    description?: string,
    inheritanceMechanisms?: GERMLINE_INHERITANCE_MECHANISM[],
  ) => {
    const genePath = parseFirebaseGenePath(genomicIndicatorsPath);
    const newGenomicIndicator = new GenomicIndicator();
    const uuidsToReview: { [key: string]: string | boolean | null } = {};
    const mutationList = this.firebaseMutationListStore.data;
    const pathogenicVariants = Object.values(mutationList ?? {}).find(mut => mut.name === PATHOGENIC_VARIANTS);
    let pathogenicVariantsNameUuid = pathogenicVariants?.name_uuid;

    if (pathogenicVariantsNameUuid === undefined) {
      const newMut = new Mutation(PATHOGENIC_VARIANTS);
      await this.addMutation(`${genePath?.genePath}/mutations`, newMut, true, false);
      pathogenicVariantsNameUuid = newMut.name_uuid;
    }
    newGenomicIndicator.associationVariants = this.transformJSArrayToFirebaseArray(
      [{ name: PATHOGENIC_VARIANTS, uuid: pathogenicVariantsNameUuid }],
      `${genomicIndicatorsPath}/associationVariants`,
    );

    const newReview = new Review(this.authStore.fullName);
    newReview.updateTime = new Date().getTime();

    newGenomicIndicator.name = name;
    if (toReview) {
      newGenomicIndicator.name_review = _.cloneDeep(newReview);
      newGenomicIndicator.name_review.added = true;
      uuidsToReview[newGenomicIndicator.name_uuid] = NEW_NAME_UUID_VALUE;
    }
    if (description) {
      newGenomicIndicator.description = description;
      if (toReview) {
        newGenomicIndicator.description_review = newReview;
        uuidsToReview[newGenomicIndicator.description_uuid] = true;
      }
    }

    if (inheritanceMechanisms) {
      inheritanceMechanisms.forEach(im => {
        newGenomicIndicator.inheritanceMechanism = im;

        if (toReview) {
          newGenomicIndicator.inheritanceMechanism_review = newReview;
          uuidsToReview[newGenomicIndicator.inheritanceMechanism_uuid] = true;
        }
      });
    }

    const hugoSymbol = genePath?.hugoSymbol;
    if (!hugoSymbol) {
      throw new SentryError('Hugo symbol is missing', genePath ?? {});
    }

    let updateObject = {};

    const pushResult = await this.firebaseRepository.push(genomicIndicatorsPath, newGenomicIndicator, false);
    if (pushResult !== undefined) {
      updateObject = { ...updateObject, ...pushResult.pushUpdateObject };
    }

    if (toReview) {
      updateObject = { ...updateObject, ...this.firebaseMetaService.getUpdateObject(hugoSymbol, true, uuidsToReview) };
    }

    await this.firebaseRepository.update('/', updateObject);
  };

  deleteGenomicIndicator = async (genomicIndicatorsPath: string) => {};

  getObject = async (path: string) => {
    return await this.firebaseRepository.get(path);
  };

  deleteObject = async (path: string) => {
    await this.firebaseRepository.delete(path);
  };

  updateObject = async (path: string, value: any) => {
    await this.firebaseRepository.update(path, value);
  };

  getDrugs = async () => {
    const drugs = await this.drugStore.getEntities({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: ['id,asc'] });
    return (
      drugs.data.reduce((acc, next) => {
        acc[next.uuid] = {
          uuid: next.uuid,
          description: '',
          priority: 0,
          synonyms: next.nciThesaurus?.synonyms?.map(synonym => synonym.name) || [],
          ncitCode: next.nciThesaurus?.code || '',
          ncitName: next.nciThesaurus?.displayName || '',
          drugName: next.name,
        };
        return acc;
      }, {} as DrugCollection) || {}
    );
  };

  saveAllGenes = async (isGermlineProp: boolean) => {
    if (!isGermlineProp) {
      try {
        const releaseBaseUrl = 'http://oncokb-data-release:8085';
        await axios.post(`${releaseBaseUrl}/api/v1/gene-data/save`);
      } catch (e) {
        throw new SentryError('Failed to save all genes', {});
      }
      return;
    }
    const drugLookup = await this.getDrugs();
    const geneLookup = ((await this.firebaseRepository.get(getFirebaseGenePath(isGermlineProp))).val() as Record<string, Gene>) ?? {};
    const vusLookup =
      ((await this.firebaseRepository.get(getFirebaseVusPath(isGermlineProp))).val() as Record<string, Record<string, Vus>>) ?? {};
    let count = 0;
    for (const [hugoSymbol, gene] of Object.entries(geneLookup)) {
      count++;
      // eslint-disable-next-line no-console
      console.log(`${count} - Saving ${hugoSymbol}...`);
      const nullableVus: Record<string, Vus> | null = vusLookup[hugoSymbol];
      await this.saveGeneWithData(isGermlineProp, hugoSymbol, drugLookup, gene, nullableVus);
      // eslint-disable-next-line no-console
      console.log('\tDone Saving.');
    }
  };

  saveGene = async (isGermlineProp: boolean, hugoSymbolProp: string) => {
    const drugLookup = await this.getDrugs();
    const nullableGene = (await this.firebaseRepository.get(getFirebaseGenePath(isGermlineProp, hugoSymbolProp))).val() as Gene | null;
    const nullableVus = (await this.firebaseRepository.get(getFirebaseVusPath(isGermlineProp, hugoSymbolProp))).val() as Record<
      string,
      Vus
    > | null;
    await this.saveGeneWithData(isGermlineProp, hugoSymbolProp, drugLookup, nullableGene, nullableVus);
  };
  saveGeneWithData = async (
    isGermlineProp: boolean,
    hugoSymbolProp: string,
    drugLookup: DrugCollection,
    nullableGene: Gene | null,
    nullableVus: Record<string, Vus> | null,
  ) => {
    const searchResponse = (await flowResult(
      flow(this.geneStore.getSearch.bind(this.geneStore))({ query: hugoSymbolProp, exact: true, noState: true }),
    )) as AxiosResponse<IGene[], any>;
    const data = searchResponse.data;
    const entrezGeneIds = (data ?? []).map(g => g?.entrezGeneId).filter((id: any) => typeof id === 'number');
    if (!isGermlineProp) {
      try {
        const releaseBaseUrl = 'http://oncokb-data-release:8085';
        if (entrezGeneIds.length > 0) {
          await axios.post(
            `${releaseBaseUrl}/api/v1/gene-data/save`,
            { entrezGeneIds },
            { headers: { 'Content-Type': 'application/json' } },
          );
        }
      } catch (e) {
        throw new SentryError('Failed to save gene ', { entrezGeneIds });
      }
      return;
    }
    const args: Parameters<typeof getDriveAnnotations>[1] = {
      gene: nullableGene == null ? undefined : nullableGene,
      vus: nullableVus == null ? undefined : Object.values(nullableVus),
      releaseGene: data.some(gene => geneIsReleased(gene, isGermlineProp)),
    };
    const driveAnnotation = getDriveAnnotations(drugLookup, args);
    await this.driveAnnotationApi.submitDriveAnnotations(driveAnnotation);
  };

  /**
   * Transforms an array to a firebase array
   * @param items An array of items to convert to firebase array structure
   * @returns An object, where key is autogenrated firebase array key and value is the item
   */
  transformJSArrayToFirebaseArray = <T>(items: T[], path: string): Record<string, T> => {
    const getArrayKeyPathParam = path === '/' ? undefined : path;
    return items.reduce((acc, item) => {
      const newKey = this.firebaseRepository.getArrayKey(getArrayKeyPathParam);
      if (newKey) {
        acc[newKey] = item;
      }
      return acc;
    }, {});
  };
}
