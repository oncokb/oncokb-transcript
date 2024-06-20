import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import PaginationCrudStore from 'app/shared/util/pagination-crud-store';
import { ENTITY_TYPE } from 'app/config/constants/constants';
import { articleClient } from 'app/shared/api/clients';
import { useState } from 'react';
import { PubMedDTO } from 'app/shared/api/generated/curation';
import { RequiredError } from 'app/shared/api/generated/curation/base';

const getPubMedArticle = () => {
  const [pubMedArticle, setPubMedArticle] = useState<PubMedDTO | null>(null);
  const [error, setError] = useState<RequiredError | null>(null);
  const [loading, setLoading] = useState(false);

  const get = async (pmid: number) => {
    try {
      setLoading(true);
      const result = await articleClient.getPubMedArticle(pmid);
      setPubMedArticle(result.data);
    } catch (responseError) {
      setError(responseError as RequiredError);
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
