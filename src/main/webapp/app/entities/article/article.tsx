import React, { useState, useEffect } from 'react';
import { connect } from 'app/shared/util/typed-inject';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Button, Input, Col, Row } from 'reactstrap';
import { getSortState, JhiPagination, JhiItemCount } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IArticle } from 'app/shared/model/article.model';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { IRootStore } from 'app/stores';
import { Column } from 'react-table';
import { TableHeader } from 'app/shared/table/TableHeader';
import { debouncedSearchWithPagination } from 'app/shared/util/pagination-crud-store';
import EntityTable from 'app/shared/table/EntityTable';
import { ENTITY_ACTION, ENTITY_TYPE } from 'app/config/constants';
import EntityActionButton from 'app/shared/button/EntityActionButton';
export interface IArticleProps extends StoreProps, RouteComponentProps<{ url: string }> {}

export const Article = (props: IArticleProps) => {
  const [search, setSearch] = useState('');
  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getSortState(props.location, ITEMS_PER_PAGE, 'id'), props.location.search)
  );

  const articleList = props.articleList;
  const loading = props.loading;
  const totalItems = props.totalItems;

  const getAllEntities = () => {
    if (search) {
      debouncedSearchWithPagination(
        search,
        paginationState.activePage - 1,
        paginationState.itemsPerPage,
        `${paginationState.sort},${paginationState.order}`,
        props.searchEntities
      );
    } else {
      props.getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      });
    }
  };

  const handleSearch = event => setSearch(event.target.value);

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (props.location.search !== endURL) {
      props.history.push(`${props.location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort, search]);

  useEffect(() => {
    const params = new URLSearchParams(props.location.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [props.location.search]);

  const sort = (fieldName: keyof IArticle) => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: fieldName,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const getArticleCitations = (article: IArticle) => {
    return `${article.journal}. ${article.pubDate};${article.volume}(${article.issue}):${article.pages}`;
  };

  const { match } = props;

  const columns: Column<IArticle>[] = [
    {
      accessor: 'title',
      Header: <TableHeader header="Title" onSort={sort('title')} paginationState={paginationState} sortField="title" />,
      width: 250,
    },
    {
      accessor: 'authors',
      Header: <TableHeader header="Authors" onSort={sort('authors')} paginationState={paginationState} sortField="authors" />,
      width: 100,
    },
    {
      id: 'citation',
      Header: 'Citation',
      Cell({
        cell: {
          row: { original },
        },
      }): any {
        return <div>{getArticleCitations(original)}</div>;
      },
    },
  ];

  return (
    <div>
      <h2 id="article-heading" data-cy="ArticleHeading">
        Articles
        <EntityActionButton className="ml-2" color="primary" entityType={ENTITY_TYPE.ARTICLE} entityAction={ENTITY_ACTION.CREATE} />
      </h2>
      <Row className="justify-content-end mb-3">
        <Col sm="4">
          <Input type="text" name="search" defaultValue={search} onChange={handleSearch} placeholder="Search" />
        </Col>
      </Row>
      <div>
        {articleList && (
          <EntityTable columns={columns} data={articleList} loading={loading} url={match.url} entityType={ENTITY_TYPE.ARTICLE} />
        )}
      </div>
      {totalItems && totalItems > 0 ? (
        <div className={articleList && articleList.length > 0 ? '' : 'd-none'}>
          <Row className="justify-content-center">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </Row>
          <Row className="justify-content-center">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </Row>
        </div>
      ) : (
        ''
      )}
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
