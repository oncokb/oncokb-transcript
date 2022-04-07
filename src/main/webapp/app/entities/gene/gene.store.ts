import { IGene } from 'app/shared/model/gene.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/genes';

export class GeneStore extends PaginationCrudStore<IGene> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default GeneStore;
