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
  AuditResourceApi,
} from './generated/curation/api';
import { DriveAnnotationApi } from './manual/drive-annotation-api';
import { EvidenceApi } from './manual/evidence-api';
import { GeneTypeApi } from './manual/gene-type-api';
import { GeneApi } from 'app/shared/api/manual/gene-api';

export const fdaSubmissionClient = new FdaSubmissionResourceApi(undefined, '', axiosInstance);
export const geneClient = new GeneResourceApi(undefined, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(undefined, '', axiosInstance);
export const alterationControllerClient = new AlterationControllerApi(undefined, '', axiosInstance);
export const ensemblGeneClient = new EnsemblGeneResourceApi(undefined, '', axiosInstance);
export const transcriptClient = new TranscriptResourceApi(undefined, '', axiosInstance);
export const flagClient = new FlagResourceApi(undefined, '', axiosInstance);
export const associationClient = new AssociationResourceApi(undefined, '', axiosInstance);
export const cancerTypeClient = new CancerTypeResourceApi(undefined, '', axiosInstance);
export const articleClient = new ArticleResourceApi(undefined, '', axiosInstance);
export const auditClient = new AuditResourceApi(undefined, '', axiosInstance);

// The following are oncokb-core clients
export const evidenceClient = new EvidenceApi(undefined, '', axiosInstance);
export const geneTypeClient = new GeneTypeApi(undefined, '', axiosInstance);
export const driveAnnotationClient = new DriveAnnotationApi(undefined, '', axiosInstance);
export const geneLegacyApi = new GeneApi(undefined, '', axiosInstance);
