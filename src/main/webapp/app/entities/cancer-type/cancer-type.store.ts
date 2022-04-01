import { ICancerType } from 'app/shared/model/cancer-type.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/cancer-types';

export class CancerTypeStore extends CrudStore<ICancerType> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default CancerTypeStore;
