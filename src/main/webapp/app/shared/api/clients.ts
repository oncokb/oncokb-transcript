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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const fdaSubmissionClient = new FdaSubmissionResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const geneClient = new GeneResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const alterationControllerClient = new AlterationControllerApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const ensemblGeneClient = new EnsemblGeneResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const transcriptClient = new TranscriptResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const flagClient = new FlagResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const associationClient = new AssociationResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const cancerTypeClient = new CancerTypeResourceApi(null, '', axiosInstance);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const articleClient = new ArticleResourceApi(null, '', axiosInstance);
