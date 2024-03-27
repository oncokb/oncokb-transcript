import { IAlleleState } from 'app/shared/model/allele-state.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/allele-states';

export class AlleleStateStore extends CrudStore<IAlleleState> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default AlleleStateStore;
