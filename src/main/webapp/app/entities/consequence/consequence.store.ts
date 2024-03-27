import { IConsequence } from 'app/shared/model/consequence.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class ConsequenceStore extends CrudStore<IConsequence> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.CONSEQUENCE));
  }
}

export default ConsequenceStore;
