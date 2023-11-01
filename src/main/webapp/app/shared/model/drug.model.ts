import { INciThesaurus } from 'app/shared/model/nci-thesaurus.model';
import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { IDrugPriority } from 'app/shared/model/drug-priority.model';
import { IFlag } from 'app/shared/model/flag.model';
import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { ITreatment } from 'app/shared/model/treatment.model';

export interface IDrug {
  id?: number;
  name?: string;
  nciThesaurus?: INciThesaurus | null;
  brands?: IDrugBrand[] | null;
  drugPriorities?: IDrugPriority[] | null;
  flags?: IFlag[] | null;
  fdaDrug?: IFdaDrug | null;
  treatments?: ITreatment[] | null;
}

export const defaultValue: Readonly<IDrug> = {};
