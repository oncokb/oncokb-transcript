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
