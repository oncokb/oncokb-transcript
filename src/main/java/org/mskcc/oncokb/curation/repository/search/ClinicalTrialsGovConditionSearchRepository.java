package org.mskcc.oncokb.curation.repository.search;

import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
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
        NativeSearchQuery nativeSearchQuery = new NativeSearchQuery(queryStringQuery(query));
        nativeSearchQuery.setPageable(pageable);
        List<ClinicalTrialsGovCondition> hits = elasticsearchTemplate
            .search(nativeSearchQuery, ClinicalTrialsGovCondition.class)
            .map(SearchHit::getContent)
            .stream()
            .collect(Collectors.toList());

        return new PageImpl<>(hits, pageable, hits.size());
    }
}
