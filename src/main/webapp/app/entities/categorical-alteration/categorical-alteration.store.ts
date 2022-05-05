import { ICategoricalAlteration } from 'app/shared/model/categorical-alteration.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/categorical-alterations';

export class CategoricalAlterationStore extends CrudStore<ICategoricalAlteration> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default CategoricalAlterationStore;
