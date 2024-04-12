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
} from './generated/api';

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
