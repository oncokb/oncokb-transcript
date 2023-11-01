import { IFdaDrug } from 'app/shared/model/fda-drug.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class FdaDrugStore extends PaginationCrudStore<IFdaDrug> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.FDA_DRUG);
  }
}

export default FdaDrugStore;
