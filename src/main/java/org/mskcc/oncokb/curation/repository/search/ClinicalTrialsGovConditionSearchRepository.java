package org.mskcc.oncokb.curation.repository.search;

import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.elasticsearch.search.sort.FieldSortBuilder;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
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
 * Spring Data Elasticsearch repository for the {@link ClinicalTrialsGovCondition} entity.
 */
public interface ClinicalTrialsGovConditionSearchRepository
    extends ElasticsearchRepository<ClinicalTrialsGovCondition, Long>, ClinicalTrialsGovConditionSearchRepositoryInternal {}

interface ClinicalTrialsGovConditionSearchRepositoryInternal {
    Page<ClinicalTrialsGovCondition> search(String query, Pageable pageable);
}

class ClinicalTrialsGovConditionSearchRepositoryInternalImpl implements ClinicalTrialsGovConditionSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    ClinicalTrialsGovConditionSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Page<ClinicalTrialsGovCondition> search(String query, Pageable pageable) {
        QueryBuilder queryBuilder = QueryBuilders.boolQuery().should(new WildcardQueryBuilder("name", query + "*").caseInsensitive(true));

        NativeSearchQueryBuilder nativeSearchQueryBuilder = new NativeSearchQueryBuilder()
            .withQuery(queryBuilder)
            .withPageable(PageRequest.of(pageable.getPageNumber(), pageable.getPageSize()));

        List<FieldSortBuilder> sortBuilders = new SortToFieldSortBuilderConverter<>(ClinicalTrialsGovCondition.class)
            .convert(pageable.getSort());
        sortBuilders
            .stream()
            .forEach(sortBuilder -> {
                nativeSearchQueryBuilder.withSort(sortBuilder);
            });

        SearchHits<ClinicalTrialsGovCondition> searchHits = elasticsearchTemplate.search(
            nativeSearchQueryBuilder.build(),
            ClinicalTrialsGovCondition.class
        );
        List<ClinicalTrialsGovCondition> hits = searchHits.map(SearchHit::getContent).stream().collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, hits.size());
    }
}
