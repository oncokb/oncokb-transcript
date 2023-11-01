import { ITreatmentPriority } from 'app/shared/model/treatment-priority.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class TreatmentPriorityStore extends CrudStore<ITreatmentPriority> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.TREATMENT_PRIORITY));
  }
}

export default TreatmentPriorityStore;
