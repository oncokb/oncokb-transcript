import { IGene } from 'app/shared/model/gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/genes';

export class GeneStore extends CrudStore<IGene> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default GeneStore;
