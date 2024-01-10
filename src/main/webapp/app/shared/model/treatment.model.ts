import { ITreatmentPriority } from 'app/shared/model/treatment-priority.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IAssociation } from 'app/shared/model/association.model';

export interface ITreatment {
  id?: number;
  name?: string | null;
  treatmentPriorities?: ITreatmentPriority[] | null;
  drugs?: IDrug[] | null;
  associations?: IAssociation[] | null;
}

export const defaultValue: Readonly<ITreatment> = {};
