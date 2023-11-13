import { IGenomicIndicator } from 'app/shared/model/genomic-indicator.model';
import { IRootStore } from 'app/stores';
import CrudStore from 'app/shared/util/crud-store';
import { ENTITY_INFO, ENTITY_TYPE } from 'app/config/constants';
import { getEntityResourcePath } from 'app/shared/util/RouteUtils';

export class GenomicIndicatorStore extends CrudStore<IGenomicIndicator> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, getEntityResourcePath(ENTITY_TYPE.GENOMIC_INDICATOR));
  }
}

export default GenomicIndicatorStore;
