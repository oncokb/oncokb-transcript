import { IClinicalTrialsGovCondition } from 'app/shared/model/clinical-trials-gov-condition.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { IAlteration } from 'app/shared/model/alteration.model';

const apiUrl = 'api/clinical-trials-gov-conditions';
const apiSearchUrl = 'api/_search/clinical-trials-gov-conditions';

export class ClinicalTrialsGovConditionStore extends PaginationCrudStore<IClinicalTrialsGovCondition> {
  searchEntities: ICrudSearchAction<IClinicalTrialsGovCondition> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    const result = yield axios.get<IClinicalTrialsGovCondition[]>(
      `${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`
    );
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return this.entities;
  }
}

export default ClinicalTrialsGovConditionStore;
