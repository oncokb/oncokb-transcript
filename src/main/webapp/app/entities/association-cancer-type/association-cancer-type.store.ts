import { IAssociationCancerType } from 'app/shared/model/association-cancer-type.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class AssociationCancerTypeStore extends CrudStore<IAssociationCancerType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.ASSOCIATION_CANCER_TYPE));
  }
}

export default AssociationCancerTypeStore;
