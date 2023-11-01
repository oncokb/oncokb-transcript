import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface ICategoricalAlteration {
  id?: number;
  alterationType?: AlterationType;
  type?: string;
  name?: string;
}

export const defaultValue: Readonly<ICategoricalAlteration> = {};
