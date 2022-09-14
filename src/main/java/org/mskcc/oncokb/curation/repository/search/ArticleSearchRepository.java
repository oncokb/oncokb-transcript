package org.mskcc.oncokb.curation.repository.search;

import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.mskcc.oncokb.curation.domain.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Article} entity.
 */
public interface ArticleSearchRepository extends ElasticsearchRepository<Article, Long>, ArticleSearchRepositoryInternal {}

interface ArticleSearchRepositoryInternal {
    Page<Article> search(String query, Pageable pageable);
}

class ArticleSearchRepositoryInternalImpl implements ArticleSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    ArticleSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<Article> search(String query, Pageable pageable) {
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(queryStringQuery(query));
        nativeSearchQuery.setPageable(pageable);
        List<Article> hits = elasticsearchTemplate
            .search(nativeSearchQuery, Article.class)
            .map(SearchHit::getContent)
            .stream()
            .collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, hits.size());
    }
}
