import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class DrugBrandStore extends PaginationCrudStore<IDrugBrand> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.DRUG_BRAND);
  }
}

export default DrugBrandStore;
