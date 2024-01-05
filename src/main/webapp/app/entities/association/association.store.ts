import { IAssociation } from 'app/shared/model/association.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class AssociationStore extends CrudStore<IAssociation> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.ASSOCIATION));
  }
}

export default AssociationStore;
