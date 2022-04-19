import { IDrugBrand } from 'app/shared/model/drug-brand.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/drug-brands';

export class DrugBrandStore extends CrudStore<IDrugBrand> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default DrugBrandStore;
