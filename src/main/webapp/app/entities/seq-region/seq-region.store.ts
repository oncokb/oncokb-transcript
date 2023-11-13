import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';
import { ENTITY_TYPE } from 'app/config/constants';

export class SeqRegionStore extends CrudStore<ISeqRegion> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.SEQ_REGION));
  }
}

export default SeqRegionStore;
