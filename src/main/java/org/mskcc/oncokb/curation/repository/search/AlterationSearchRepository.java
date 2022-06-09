package org.mskcc.oncokb.curation.repository.search;

import java.util.List;
import java.util.stream.Collectors;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.mskcc.oncokb.curation.domain.Alteration;
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
 * Spring Data Elasticsearch repository for the {@link Alteration} entity.
 */
public interface AlterationSearchRepository extends ElasticsearchRepository<Alteration, Long>, AlterationSearchRepositoryInternal {}

interface AlterationSearchRepositoryInternal {
    Page<Alteration> search(String query, Pageable pageable);
}

class AlterationSearchRepositoryInternalImpl implements AlterationSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    AlterationSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<Alteration> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("name", query + "*"));

        NativeSearchQueryBuilder nativeSearchQueryBuilder = new NativeSearchQueryBuilder()
            .withQuery(queryBuilder)
            .withPageable(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));

        List<FieldSortBuilder> sortBuilders = new SortToFieldSortBuilderConverter<>(Alteration.class).convert(pageable.getSort());
        sortBuilders
            .stream()
            .forEach(sortBuilder -> {
                nativeSearchQueryBuilder.withSort(sortBuilder);
            });

        SearchHits<Alteration> searchHits = elasticsearchTemplate.search(nativeSearchQueryBuilder.build(), Alteration.class);
        List<Alteration> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, searchHits.getTotalHits());
    }
}
