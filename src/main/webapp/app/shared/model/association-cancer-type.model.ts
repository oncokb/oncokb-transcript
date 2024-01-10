import { IAssociation } from 'app/shared/model/association.model';
import { ICancerType } from 'app/shared/model/cancer-type.model';
import { AssociationCancerTypeRelation } from 'app/shared/model/enumerations/association-cancer-type-relation.model';

export interface IAssociationCancerType {
  id?: number;
  relation?: AssociationCancerTypeRelation;
  association?: IAssociation | null;
  cancerType?: ICancerType | null;
}

export const defaultValue: Readonly<IAssociationCancerType> = {};
