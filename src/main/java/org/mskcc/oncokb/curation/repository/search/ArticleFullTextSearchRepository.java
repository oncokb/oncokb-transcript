package org.mskcc.oncokb.curation.repository.search;

import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;

import java.util.stream.Stream;
import org.mskcc.oncokb.curation.domain.ArticleFullText;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link ArticleFullText} entity.
 */
public interface ArticleFullTextSearchRepository
    extends ElasticsearchRepository<ArticleFullText, Long>, ArticleFullTextSearchRepositoryInternal {}

interface ArticleFullTextSearchRepositoryInternal {
    Stream<ArticleFullText> search(String query);
}

class ArticleFullTextSearchRepositoryInternalImpl implements ArticleFullTextSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    ArticleFullTextSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Stream<ArticleFullText> search(String query) {
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(queryStringQuery(query));
        return elasticsearchTemplate.search(nativeSearchQuery, ArticleFullText.class).map(SearchHit::getContent).stream();
    }
}
