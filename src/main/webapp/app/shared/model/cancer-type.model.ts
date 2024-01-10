import { IAssociationCancerType } from 'app/shared/model/association-cancer-type.model';
import { ISynonym } from 'app/shared/model/synonym.model';
import { TumorForm } from 'app/shared/model/enumerations/tumor-form.model';

export interface ICancerType {
  id?: number;
  code?: string | null;
  color?: string | null;
  level?: number;
  mainType?: string;
  subtype?: string | null;
  tissue?: string | null;
  tumorForm?: TumorForm;
  associationCancerTypes?: IAssociationCancerType[] | null;
  children?: ICancerType[] | null;
  synonyms?: ISynonym[] | null;
  parent?: ICancerType | null;
}

export const defaultValue: Readonly<ICancerType> = {};
