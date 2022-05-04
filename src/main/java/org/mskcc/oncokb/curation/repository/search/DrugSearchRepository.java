package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.mskcc.oncokb.curation.domain.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link Drug} entity.
 */
public interface DrugSearchRepository extends ElasticsearchRepository<Drug, Long>, DrugSearchRepositoryInternal {}

interface DrugSearchRepositoryInternal {
    Page<Drug> search(String query, Pageable pageable);
}

class DrugSearchRepositoryInternalImpl implements DrugSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    DrugSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<Drug> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("name", query + "*"))
            .should(new WildcardQueryBuilder("code", query + "*"))
            .should(new WildcardQueryBuilder("brands.name", query + "*"));
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(queryBuilder).withPageable(pageable).build();
        SearchHits<Drug> searchHits = elasticsearchTemplate.search(nativeSearchQuery, Drug.class);
        List<Drug> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
