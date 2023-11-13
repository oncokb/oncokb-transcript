import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class DrugStore extends PaginationCrudStore<IDrug> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.DRUG);
  }
}

export default DrugStore;
