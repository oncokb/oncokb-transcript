import { ISeqRegion } from 'app/shared/model/seq-region.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/seq-regions';

export class SeqRegionStore extends CrudStore<ISeqRegion> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default SeqRegionStore;
