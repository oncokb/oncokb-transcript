import { ITreatment } from 'app/shared/model/treatment.model';

export interface ITreatmentPriority {
  id?: number;
  priority?: number;
  treatment?: ITreatment | null;
}

export const defaultValue: Readonly<ITreatmentPriority> = {};
