import { getFdaSubmissionLinks } from 'app/entities/companion-diagnostic-device/companion-diagnostic-device';
import { IAssociation } from '../model/association.model';
import { getAlterationName, getCancerTypeName, getGeneNamesStringFromAlterations, getTreatmentName } from './utils';

export const getGeneFilterValue = (data: IAssociation) => getGeneNamesStringFromAlterations(data.alterations || []);

export const getAlterationFilterValue = (data: IAssociation) => getAlterationName(data.alterations || []);

export const getCancerTypeFilterValue = (data: IAssociation) => data.cancerTypes?.map(ct => getCancerTypeName(ct)).join(', ') ?? '';

export const getDrugFilterValue = (data: IAssociation) =>
  data.drugs ? getTreatmentName(data.drugs, data.rules?.filter(rule => rule.entity === 'DRUG')[0]) : '';

export const getFdaFilterValue = (data: IAssociation) =>
  data.fdaSubmissions ? (getFdaSubmissionLinks(data.fdaSubmissions, false) as string) : '';
