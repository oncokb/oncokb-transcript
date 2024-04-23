import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { articleClient } from 'app/shared/api/clients';
import { useState } from 'react';

const getPubMedArticle = () => {
  const [pubMedArticle, setPubMedArticle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const get = async pmid => {
    try {
      setLoading(true);
      const result = await articleClient.getPubMedArticle(pmid);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setPubMedArticle(result.data);
    } catch (responseError) {
      setError(responseError);
    } finally {
      setLoading(false);
    }
  };

  return {
    pubMedArticle,
    error,
    loading,
    get,
  };
};

export class ArticleStore extends PaginationCrudStore<IArticle> {
  getPubMedArticle = getPubMedArticle;

  constructor(protected rootStore: IRootStore) {
    super(rootStore, ENTITY_TYPE.ARTICLE);
  }
}

export default ArticleStore;
