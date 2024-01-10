import React from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { RouteComponentProps } from 'react-router-dom';
import { IArticle } from 'app/shared/model/article.model';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { DEFAULT_ENTITY_SORT_FIELD, ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
import { getEntityTableActionsColumn, getPaginationFromSearchParams } from 'app/shared/util/utils';
import OncoKBAsyncTable, { PaginationState } from 'app/shared/table/OncoKBAsyncTable';

const defaultPaginationState: PaginationState<IArticle> = {
  order: 'asc',
  sort: DEFAULT_ENTITY_SORT_FIELD[ENTITY_TYPE.ARTICLE] as keyof IArticle,
  activePage: 1,
};

export interface IArticleProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Article = (props: IArticleProps) => {
  const articleList = props.articleList;

  const getArticleCitations = (article: IArticle) => {
    return article.pmid ? `${article.journal}. ${article.pubDate};${article.volume}(${article.issue}):${article.pages}` : '';
  };

  const columns: Column<IArticle>[] = [
    {
      accessor: 'type',
      Header: 'Type',
    },
    {
      accessor: 'pmid',
      Header: 'Pmid',
    },
    {
      accessor: 'title',
      Header: 'Title',
    },
    {
      id: 'citation',
      Header: 'Citation',
      Cell(cell: { original: IArticle }) {
        return <div>{getArticleCitations(cell.original)}</div>;
      },
    },
    getEntityTableActionsColumn(ENTITY_TYPE.ARTICLE),
  ];

  return (
    <div>
      <h2 id="article-heading" data-cy="ArticleHeading">
        Articles
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.ARTICLE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <div>
        {articleList && (
          <OncoKBAsyncTable
            data={articleList.concat()}
            columns={columns}
            loading={props.loading}
            initialPaginationState={getPaginationFromSearchParams(props.location.search) || defaultPaginationState}
            searchEntities={props.searchEntities}
            getEntities={props.getEntities}
            totalItems={props.totalItems}
          />
        )}
      </div>
    </div>
  );
};

const mapStoreToProps = ({ articleStore }: IRootStore) => ({
  articleList: articleStore.entities,
  loading: articleStore.loading,
  totalItems: articleStore.totalItems,
  searchEntities: articleStore.searchEntities,
  getEntities: articleStore.getEntities,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(Article);
