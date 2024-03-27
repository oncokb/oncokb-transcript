import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';

export class ArticleStore extends PaginationCrudStore<IArticle> {
  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ARTICLE);
  }
}

export default ArticleStore;
