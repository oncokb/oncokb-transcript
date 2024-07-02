import { ISynonym } from 'app/shared/model/synonym.model';
import { IAssociation } from 'app/shared/model/association.model';
import { TumorForm } from 'app/shared/model/enumerations/tumor-form.model';

export interface ICancerType {
  id: number;
  code: string | null;
  color: string | null;
  level: number;
  mainType: string;
  subtype: string | null;
  tissue: string | null;
  tumorForm: TumorForm;
  children: ICancerType[] | null;
  synonyms: ISynonym[] | null;
  parent: ICancerType | null;
  associations: IAssociation[] | null;
}
