package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.mskcc.oncokb.curation.domain.Drug;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
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
            .should(new WildcardQueryBuilder("name", query + "*").caseInsensitive(true))
            .should(new WildcardQueryBuilder("code", query + "*").caseInsensitive(true))
            .should(new WildcardQueryBuilder("brands.name", query + "*").caseInsensitive(true));

        NativeSearchQueryBuilder nativeSearchQueryBuilder = new NativeSearchQueryBuilder()
            .withQuery(queryBuilder)
            .withPageable(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));

        List<FieldSortBuilder> sortBuilders = new SortToFieldSortBuilderConverter<>(Drug.class).convert(pageable.getSort());
        sortBuilders
            .stream()
            .forEach(sortBuilder -> {
                nativeSearchQueryBuilder.withSort(sortBuilder);
            });

        SearchHits<Drug> searchHits = elasticsearchTemplate.search(nativeSearchQueryBuilder.build(), Drug.class);
        List<Drug> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
