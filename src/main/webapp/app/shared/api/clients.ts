import axiosInstance from './axiosInstance';
import {
  AlterationControllerApi,
  AlterationResourceApi,
  EnsemblGeneResourceApi,
  FdaSubmissionResourceApi,
  TranscriptResourceApi,
  FlagResourceApi,
  GeneResourceApi,
  AssociationResourceApi,
  CancerTypeResourceApi,
  ArticleResourceApi,
} from './generated/curation/api';
import { DriveAnnotationApi } from './manual/drive-annotation-api';
import { EvidenceApi } from './manual/evidence-api';
import { GeneTypeApi } from './manual/gene-type-api';

export const fdaSubmissionClient = new FdaSubmissionResourceApi(null, '', axiosInstance);
export const geneClient = new GeneResourceApi(null, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
export const alterationControllerClient = new AlterationControllerApi(null, '', axiosInstance);
export const ensemblGeneClient = new EnsemblGeneResourceApi(null, '', axiosInstance);
export const transcriptClient = new TranscriptResourceApi(null, '', axiosInstance);
export const flagClient = new FlagResourceApi(null, '', axiosInstance);
export const associationClient = new AssociationResourceApi(null, '', axiosInstance);
export const cancerTypeClient = new CancerTypeResourceApi(null, '', axiosInstance);
export const articleClient = new ArticleResourceApi(null, '', axiosInstance);

export const evidenceClient = new EvidenceApi(null, '', axiosInstance);
export const geneTypeClient = new GeneTypeApi(null, '', axiosInstance);
export const driveAnnotationClient = new DriveAnnotationApi(null, '', axiosInstance);
