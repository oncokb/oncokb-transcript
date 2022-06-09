package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.mskcc.oncokb.curation.domain.CancerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link CancerType} entity.
 */
public interface CancerTypeSearchRepository extends ElasticsearchRepository<CancerType, Long>, CancerTypeSearchRepositoryInternal {}

interface CancerTypeSearchRepositoryInternal {
    Page<CancerType> search(String query, Pageable pageable);
}

class CancerTypeSearchRepositoryInternalImpl implements CancerTypeSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    CancerTypeSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<CancerType> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("mainType", query + "*"));

        NativeSearchQueryBuilder nativeSearchQueryBuilder = new NativeSearchQueryBuilder()
            .withQuery(queryBuilder)
            .withPageable(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));

        List<FieldSortBuilder> sortBuilders = new SortToFieldSortBuilderConverter<>(CancerType.class).convert(pageable.getSort());
        sortBuilders
            .stream()
            .forEach(sortBuilder -> {
                nativeSearchQueryBuilder.withSort(sortBuilder);
            });

        SearchHits<CancerType> searchHits = elasticsearchTemplate.search(nativeSearchQueryBuilder.build(), CancerType.class);
        List<CancerType> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
