import { IConsequence } from 'app/shared/model/consequence.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/consequences';
const apiSearchUrl = 'api/_search/consequences';

export class ConsequenceStore extends CrudStore<IConsequence> {
  searchEntities: ICrudSearchAction<IConsequence> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    return yield axios.get<IConsequence[]>(`${apiSearchUrl}?query=${query}`);
  }
}

export default ConsequenceStore;
