import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/alterations';

export class AlterationStore extends CrudStore<IAlteration> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default AlterationStore;
