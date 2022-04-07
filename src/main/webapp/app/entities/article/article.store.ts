import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import { action } from 'mobx';
import axios from 'axios';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';

const apiUrl = 'api/articles';

export class ArticleStore extends PaginationCrudStore<IArticle> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, apiUrl);
  }
}

export default ArticleStore;
