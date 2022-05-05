import { CategoricalAlterationType } from 'app/shared/model/enumerations/categorical-alteration-type.model';
import { AlterationType } from 'app/shared/model/enumerations/alteration-type.model';

export interface ICategoricalAlteration {
  id?: number;
  name?: string;
  type?: CategoricalAlterationType;
  alterationType?: AlterationType;
}

export const defaultValue: Readonly<ICategoricalAlteration> = {};
