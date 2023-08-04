import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IAlteration } from '../model/alteration.model';
import { IDrug } from '../model/drug.model';
import { v4 as uuidv4 } from 'uuid';

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
}

export const generateUuid = () => {
  return uuidv4();
};

export function getSectionClassName(theFirst = false) {
  return `${theFirst ? 'pb-3' : 'border-top py-3'}`;
}
