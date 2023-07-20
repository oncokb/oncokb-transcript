import axiosInstance from './axiosInstance';
import { AlterationControllerApi, AlterationResourceApi, BiomarkerAssociationResourceApi, FdaSubmissionResourceApi } from './generated/api';

export const biomarkerAssociationClient = new BiomarkerAssociationResourceApi(null, '', axiosInstance);
export const fdaSubmissionClient = new FdaSubmissionResourceApi(null, '', axiosInstance);
export const alterationClient = new AlterationResourceApi(null, '', axiosInstance);
export const alterationControllerClient = new AlterationControllerApi(null, '', axiosInstance);
