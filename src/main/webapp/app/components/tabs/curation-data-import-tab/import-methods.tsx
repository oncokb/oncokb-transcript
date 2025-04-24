import { FirebaseGeneService } from 'app/service/firebase/firebase-gene-service';
import { FirebaseGeneReviewService } from 'app/service/firebase/firebase-gene-review-service';
import { getDuplicateMutations, getFirebaseGenePath, getFirebaseVusPath } from 'app/shared/util/firebase/firebase-utils';
import { DataImportStatus, DataRow } from 'app/components/tabs/curation-data-import-tab/CurationDataImportTab';
import { ALLELE_STATE } from 'app/config/constants/firebase';
import {
  FIREBASE_ONCOGENICITY,
  GenomicIndicatorList,
  Mutation,
  MutationEffect,
  MutationList,
  Review,
  VusObjList,
} from 'app/shared/model/firebase/firebase.model';
import pluralize from 'pluralize';
import { PATHOGENICITY, REFERENCE_GENOME } from 'app/config/constants/constants';
import { uniq } from 'lodash';
import { FirebaseMetaService } from 'app/service/firebase/firebase-meta-service';
import { AuthStore } from 'app/stores';
import {
  Alteration,
  Alteration as ApiAlteration,
  AlterationTypeEnum,
  AnnotateAlterationBody,
  Gene,
} from 'app/shared/api/generated/curation';
import { flow, flowResult } from 'mobx';
import AlterationStore from 'app/entities/alteration/alteration.store';

export type GeneDI = {
  hugo_symbol: string;
};

export type GenericDI = GeneDI & {
  value: string;
};

export type GenomicIndicatorDI = GeneDI & {
  genomic_indicator: string;
  allele_state?: string;
  description?: string;
};

export type MutationDI = GeneDI & {
  alteration: string;
  name?: string;
  protein_change?: string;
};

export type SomaticMutationDI = MutationDI & {
  oncogenicity: string;
  mutation_effect?: string;
  description?: string;
};

export type GermlineMutationDI = MutationDI & {
  pathogenicity: string;
  description?: string;
};

const alleleStateCheck = async (
  alleleStates: string[],
  onValidAlleleStates: () => Promise<DataImportStatus>,
): Promise<DataImportStatus> => {
  let status = new DataImportStatus();

  const unmappedAlleleStates: string[] = [];
  if (alleleStates) {
    // validate allele state is correct
    alleleStates.forEach(alleleState => {
      if (!Object.values(ALLELE_STATE).includes(alleleState as ALLELE_STATE)) {
        unmappedAlleleStates.push(alleleState);
      }
    });
  }
  if (unmappedAlleleStates.length > 0) {
    status.status = 'error';
    status.message = `${unmappedAlleleStates.join(', ')} ${pluralize('is', unmappedAlleleStates.length)} not supported. Only ${Object.values(ALLELE_STATE).join(', ')} are supported.`;
  } else {
    status = await onValidAlleleStates();
  }
  return status;
};

const importStatusCheck = (status: string, allowedStatus: string[]): DataImportStatus => {
  const importStatus = new DataImportStatus();

  if (status) {
    if (!allowedStatus.includes(status)) {
      importStatus.status = 'error';
      importStatus.message = `${status} not supported. Only ${allowedStatus.join(', ')} are supported.`;
    }
  }
  return importStatus;
};

const oncogenicityCheck = (pathogenicity: string): DataImportStatus => {
  return importStatusCheck(pathogenicity, uniq(Object.values(FIREBASE_ONCOGENICITY)));
};

const pathogenicityCheck = (pathogenicity: string): DataImportStatus => {
  return importStatusCheck(pathogenicity, Object.values(PATHOGENICITY));
};

export const geneCheck = async (
  firebaseGeneService: FirebaseGeneService,
  isGermline: boolean,
  createGene: boolean,
  hugoSymbol: string,
  onGeneExists: () => Promise<DataImportStatus>,
) => {
  const status = new DataImportStatus();
  hugoSymbol = hugoSymbol.trim();
  if (hugoSymbol) {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const geneData = await firebaseGeneService.getObject(genePath);
    if (geneData.exists()) {
      return onGeneExists();
    } else {
      if (createGene) {
        await firebaseGeneService.createGene(hugoSymbol, isGermline);
        return onGeneExists();
      } else {
        status.status = 'error';
        status.message = 'Gene does not exist. Please create before importing';
      }
    }
  } else {
    status.status = 'error';
    status.message = 'Gene is missing from data';
  }
  return status;
};

export const saveGenericGeneData = async (
  firebaseGeneService: FirebaseGeneService,
  firebaseGeneReviewService: FirebaseGeneReviewService,
  isGermline: boolean,
  createGene: boolean,
  genePropKey: string,
  dataRow: DataRow<GenericDI>,
): Promise<DataImportStatus> => {
  const data = dataRow.data;
  const hugoSymbol = data.hugo_symbol.trim();
  const propValue = data.value.trim();
  return geneCheck(firebaseGeneService, isGermline, createGene, hugoSymbol, async () => {
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const valPath = genePath + '/' + genePropKey;
    const valData = await firebaseGeneService.getObject(valPath);
    const status = new DataImportStatus();
    if (valData.exists()) {
      const reviewData = await firebaseGeneService.getObject(`${genePath}/${genePropKey}_review`);
      const uuidData = await firebaseGeneService.getObject(`${genePath}/${genePropKey}_uuid`);
      if (propValue !== valData.val()) {
        await firebaseGeneReviewService.updateReviewableContent(valPath, valData.val(), propValue, reviewData.val(), uuidData.val());
        status.status = 'complete';
      } else {
        status.status = 'warning';
        status.message = 'The data is identical to production, no update needed.';
      }
    } else {
      status.status = 'error';
      status.message = `The gene property \`${genePropKey}\`does not exist. Skip importing`;
    }
    return status;
  });
};

export const saveGenomicIndicator = async (
  firebaseGeneService: FirebaseGeneService,
  dataRow: DataRow<GenomicIndicatorDI>,
  hugoSymbol: string,
  isGermline: boolean,
  createGene: boolean,
) => {
  return geneCheck(firebaseGeneService, isGermline, createGene, hugoSymbol, async () => {
    const genomicIndicatorName = dataRow.data.genomic_indicator.trim();
    const genePath = getFirebaseGenePath(isGermline, hugoSymbol);
    const gipath = genePath + '/genomic_indicators';
    const giData = await firebaseGeneService.getObject(gipath);
    const alleleStates = (dataRow.data.allele_state || '')
      .split(',')
      .map(state => state.trim())
      .filter(state => !!state);
    return await alleleStateCheck(alleleStates, async () => {
      let status = new DataImportStatus();
      if (giData.exists()) {
        const genomicIndicators: GenomicIndicatorList = giData.val();
        if (Object.values(genomicIndicators).filter(gi => gi.name.toLowerCase() === genomicIndicatorName.toLowerCase()).length > 0) {
          status.status = 'error';
          status.message = 'Genomic indicator already exists';
        } else {
          status = await saveGenomicIndicatorToFirebase(
            firebaseGeneService,
            gipath,
            genomicIndicatorName,
            dataRow.data.description,
            alleleStates as ALLELE_STATE[],
          );
        }
      } else {
        status = await saveGenomicIndicatorToFirebase(
          firebaseGeneService,
          gipath,
          genomicIndicatorName,
          dataRow.data.description,
          alleleStates as ALLELE_STATE[],
        );
      }
      return status;
    });
  });
};

const saveGenomicIndicatorToFirebase = async (
  firebaseGeneService: FirebaseGeneService,
  genomicIndicatorsPath: string,
  name: string,
  description?: string,
  alleleStates?: ALLELE_STATE[],
): Promise<DataImportStatus> => {
  await firebaseGeneService.addGenomicIndicator(true, genomicIndicatorsPath, name, description, alleleStates);
  return {
    status: 'complete',
    message: '',
  };
};
export const saveMutation = async (
  authStore: AuthStore,
  firebaseGeneService: FirebaseGeneService,
  firebaseGeneReviewService: FirebaseGeneReviewService,
  firebaseMetaService: FirebaseMetaService,
  alterationStore: AlterationStore,
  isGermline: boolean,
  createGene: boolean,
  dataRow: DataRow<GermlineMutationDI | SomaticMutationDI>,
  mutationList: MutationList,
  vusList: VusObjList,
): Promise<DataImportStatus> => {
  // validate duplication
  const hugoSymbol = dataRow.data.hugo_symbol;
  const mutation = new Mutation(dataRow.data.alteration);
  let mutationImpactStatusUpdated = false;

  const existingMuts = getDuplicateMutations(
    [mutation.name],
    mutationList,
    `${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`,
    vusList,
    {
      useFullAlterationName: true,
      exact: true,
    },
  );

  return geneCheck(firebaseGeneService, isGermline, createGene, hugoSymbol, async () => {
    const request: AnnotateAlterationBody[] = [
      {
        referenceGenome: REFERENCE_GENOME.GRCH37,
        alteration: { alteration: mutation.name, genes: [{ hugoSymbol } as Gene] } as ApiAlteration,
      },
    ];
    try {
      const annotatedAlterations = await flowResult(flow(alterationStore.annotateAlterations)(request));
      const annotatedAlteration: Alteration = annotatedAlterations[0].entity;
      let proteinChange = annotatedAlteration.proteinChange;
      if (dataRow.data.protein_change) {
        proteinChange = dataRow.data.protein_change.replace('p.', '').trim();
      }
      mutation.alterations = [
        {
          type: annotatedAlteration.type ?? AlterationTypeEnum.Unknown,
          alteration: dataRow.data.alteration,
          name: dataRow.data.name ?? annotatedAlteration.name,
          consequence: annotatedAlteration.consequence?.name ?? '',
          comment: '',
          excluding: [],
          genes: annotatedAlteration.genes || [],
          proteinChange,
          proteinStart: annotatedAlteration.start,
          proteinEnd: annotatedAlteration.end,
          refResidues: annotatedAlteration.refResidues || '',
          varResidues: annotatedAlteration.variantResidues || '',
        },
      ];
    } catch (e) {
      return {
        status: 'error',
        message: "We aren't able to annotate the alteration. Please reach out to dev team.",
      };
    }

    const isGermlineData = (data: GermlineMutationDI | SomaticMutationDI): data is GermlineMutationDI => {
      return isGermline;
    };
    if (isGermlineData(dataRow.data)) {
      const data = dataRow.data;
      if (data.pathogenicity) {
        const importStatus: DataImportStatus = pathogenicityCheck(data.pathogenicity);
        if (importStatus.status === 'error') {
          return importStatus;
        }
      }
      mutation.mutation_effect.pathogenic = data.pathogenicity as PATHOGENICITY;
      mutation.mutation_effect.pathogenic_review = new Review(authStore.fullName, '');
      if (data.description) {
        mutation.mutation_effect.description = data.description;
        mutation.mutation_effect.description_review = new Review(authStore.fullName, '');
      }
      mutationImpactStatusUpdated = true;
    } else {
      const data = dataRow.data;
      if (data.oncogenicity) {
        const importStatus: DataImportStatus = oncogenicityCheck(data.oncogenicity);
        if (importStatus.status === 'error') {
          return importStatus;
        }
      }
      mutation.mutation_effect.oncogenic = data.oncogenicity as FIREBASE_ONCOGENICITY;
      mutation.mutation_effect.oncogenic_review = new Review(authStore.fullName, '');
      if (data.description) {
        mutation.mutation_effect.description = data.description;
        mutation.mutation_effect.description_review = new Review(authStore.fullName, '');
      }
      mutationImpactStatusUpdated = true;
    }

    let mutIsVus = false;

    // Delete existing VUS before importing
    for (const mut of existingMuts) {
      if (mut.inVusList) {
        mutIsVus = true;
        await firebaseGeneService.firebaseRepository.delete(`${getFirebaseVusPath(isGermline, hugoSymbol)}/${mut.duplicate}`);
      } else {
        if (mut.inMutationList) {
          const arrayKey = mut.firebaseMutationPath.split('/').reverse()[0];
          const existingMutation = mutationList[arrayKey];
          if (!existingMutation.mutation_effect) {
            existingMutation.mutation_effect = new MutationEffect();
          }
          let updateObject = {};
          if (isGermlineData(dataRow.data)) {
            updateObject = {
              ...updateObject,
              ...(await firebaseGeneReviewService.updateReviewableContent(
                `${mut.firebaseMutationPath}/mutation_effect/pathogenic`,
                existingMutation.mutation_effect.pathogenic,
                mutation.mutation_effect.pathogenic,
                existingMutation.mutation_effect.pathogenic_review,
                existingMutation.mutation_effect.pathogenic_uuid,
                true,
                false,
              )),
            };
          } else {
            updateObject = {
              ...updateObject,
              ...(await firebaseGeneReviewService.updateReviewableContent(
                `${mut.firebaseMutationPath}/mutation_effect/oncogenic`,
                existingMutation.mutation_effect.oncogenic,
                mutation.mutation_effect.oncogenic,
                existingMutation.mutation_effect.oncogenic_review,
                existingMutation.mutation_effect.oncogenic_uuid,
                true,
                false,
              )),
            };
          }
          if (mutation.mutation_effect.description) {
            updateObject = {
              ...updateObject,
              ...(await firebaseGeneReviewService.updateReviewableContent(
                `${mut.firebaseMutationPath}/mutation_effect/description`,
                existingMutation.mutation_effect.description,
                mutation.mutation_effect.description,
                existingMutation.mutation_effect.description_review,
                existingMutation.mutation_effect.description_uuid,
                true,
                false,
              )),
            };
          }

          await firebaseGeneService.updateObject('/', updateObject);
          return {
            status: 'complete',
            message: 'Overrode existing mutation',
          };
        }
      }
    }

    try {
      await firebaseGeneService
        .addMutation(`${getFirebaseGenePath(isGermline, hugoSymbol)}/mutations`, mutation, isGermline, mutIsVus, dataRow.data.description)
        .then(async () => {
          if (mutationImpactStatusUpdated) {
            let uuid: string;
            if (isGermline) {
              uuid = mutation.mutation_effect.pathogenic_uuid;
            } else {
              uuid = mutation.mutation_effect.oncogenic_uuid;
            }
            // I can't use updateReviewableContent here due to lacking of the firebase path
            await firebaseMetaService.updateMeta(hugoSymbol, uuid, true, isGermline);
          }
        });
      return {
        status: 'complete',
        message: 'Added new mutation',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to add/update mutation.',
      };
    }
  });
};
