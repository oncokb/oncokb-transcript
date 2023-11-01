import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class CategoricalAlterationStore extends CrudStore<ICategoricalAlteration> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.CATEGORICAL_ALTERATION));
  }
}

export default CategoricalAlterationStore;
