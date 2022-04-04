import { IDrugSynonym } from 'app/shared/model/drug-synonym.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import CrudStore from 'app/shared/util/crud-store';

const apiUrl = 'api/drug-synonyms';

export class DrugSynonymStore extends CrudStore<IDrugSynonym> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default DrugSynonymStore;
