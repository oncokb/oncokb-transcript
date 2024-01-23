import { IDrug } from 'app/shared/model/drug.model';
import { IRootStore } from 'app/stores';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import CrudStore from 'app/shared/util/crud-store';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class DrugStore extends CrudStore<IDrug> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.DRUG));
  }
}

export default DrugStore;
