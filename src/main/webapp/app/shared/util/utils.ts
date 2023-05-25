import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IAlteration } from '../model/alteration.model';
import { IDrug } from '../model/drug.model';

export const getCancerTypeName = (cancerType: ICancerType): string => {
  let name = '';
  if (cancerType) {
    if (cancerType.subtype) {
      name = `${cancerType.subtype} (${cancerType.code})`;
    } else {
      name = cancerType.mainType;
    }
  }
  return name;
};

export const getTreatmentName = (drugs: IDrug[]): string => {
  return drugs.map(drug => drug.name).join(' + ');
};

export const getAlterationName = (alterations: IAlteration[]): string => {
  return alterations.map(alteration => alteration.name).join(', ');
};
