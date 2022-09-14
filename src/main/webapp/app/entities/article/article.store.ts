import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ICrudSearchAction } from 'app/shared/util/jhipster-types';

const apiUrl = 'api/articles';
const apiSearchUrl = 'api/_search/articles';

export class ArticleStore extends PaginationCrudStore<IArticle> {
  searchEntities: ICrudSearchAction<IArticle> = this.readHandler(this.getSearch);
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
  *getSearch({ query, page, size, sort }) {
    return yield axios.get<IArticle[]>(`${apiSearchUrl}?query=${query}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`);
  }
}

export default ArticleStore;
