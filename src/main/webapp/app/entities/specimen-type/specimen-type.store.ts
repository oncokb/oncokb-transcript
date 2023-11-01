import { ISpecimenType } from 'app/shared/model/specimen-type.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { ENTITY_TYPE } from 'app/config/constants';

export class SpecimenTypeStore extends CrudStore<ISpecimenType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.SPECIMEN_TYPE));
  }
}

export default SpecimenTypeStore;
