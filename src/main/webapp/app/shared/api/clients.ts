import axiosInstance from './axiosInstance';
import {
  AlterationControllerApi,
  AlterationResourceApi,
  BiomarkerAssociationResourceApi,
  EnsemblGeneResourceApi,
  FdaSubmissionResourceApi,
  TranscriptResourceApi,
  FlagResourceApi,
  GeneResourceApi,
} from './generated/api';

export const biomarkerAssociationClient = new BiomarkerAssociationResourceApi(null, '', axiosInstance);
export const fdaSubmissionClient = new FdaSubmissionResourceApi(null, '', axiosInstance);
export const geneClient = new GeneResourceApi(null, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
export const alterationControllerClient = new AlterationControllerApi(null, '', axiosInstance);
export const ensemblGeneClient = new EnsemblGeneResourceApi(null, '', axiosInstance);
export const transcriptClient = new TranscriptResourceApi(null, '', axiosInstance);
export const flagClient = new FlagResourceApi(null, '', axiosInstance);
