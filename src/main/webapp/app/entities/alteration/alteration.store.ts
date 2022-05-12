import { IAlteration } from 'app/shared/model/alteration.model';
import { IRootStore } from 'app/stores';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';
import { Alteration, AlterationControllerApi } from 'app/shared/api/generated';
import axiosInstance from 'app/shared/api/axiosInstance';

const apiUrl = 'api/alterations';
const apiSearchUrl = 'api/_search/alterations';

export class AlterationStore extends PaginationCrudStore<IAlteration> {
  public proteinChangeAlteration: IAlteration;
  searchEntities: ICrudSearchAction<IAlteration> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    const result = yield axios.get<IAlteration[]>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`);
    this.entities = result.data;
    this.totalItems = result.headers['x-total-count'];
    return this.entities;
  }
  *annotateAlteration({ geneIds, alteration }) {
    const alt = {
      genes: geneIds.map(id => ({ id })),
      alteration,
    };
    const result = yield new AlterationControllerApi(null, '', axiosInstance).annotateAlteration(alt as Alteration);
    this.proteinChangeAlteration = result.data;
    return this.proteinChangeAlteration;
  }
}

export default AlterationStore;
