import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE, GET_ALL_DRUGS_PAGE_SIZE } from 'app/config/constants/constants';

export class DrugStore extends PaginationCrudStore<IDrug> {
  public drugList: IDrug[] = [];

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.DRUG);
    this.setDrugList();
  }

  async setDrugList() {
    const drugs = await this.getEntities({ page: 0, size: GET_ALL_DRUGS_PAGE_SIZE, sort: 'id,asc' });
    this.drugList = drugs['data'];
  }
}

export default DrugStore;
