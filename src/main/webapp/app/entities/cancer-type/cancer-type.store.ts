import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants';

export class CancerTypeStore extends PaginationCrudStore<ICancerType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.CANCER_TYPE);
  }
}

export default CancerTypeStore;
