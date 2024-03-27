import { IDrugPriority } from 'app/shared/model/drug-priority.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class DrugPriorityStore extends CrudStore<IDrugPriority> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.DRUG_PRIORITY));
  }
}

export default DrugPriorityStore;
