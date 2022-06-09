package org.mskcc.oncokb.curation.repository.search;

import java.util.stream.Stream;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.WildcardQueryBuilder;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link CompanionDiagnosticDevice} entity.
 */
public interface CompanionDiagnosticDeviceSearchRepository
    extends ElasticsearchRepository<CompanionDiagnosticDevice, Long>, CompanionDiagnosticDeviceSearchRepositoryInternal {}

interface CompanionDiagnosticDeviceSearchRepositoryInternal {
    Stream<CompanionDiagnosticDevice> search(String query);
}

class CompanionDiagnosticDeviceSearchRepositoryInternalImpl implements CompanionDiagnosticDeviceSearchRepositoryInternal {

    private final ElasticsearchRestTemplate elasticsearchTemplate;

    CompanionDiagnosticDeviceSearchRepositoryInternalImpl(ElasticsearchRestTemplate elasticsearchTemplate) {
        this.elasticsearchTemplate = elasticsearchTemplate;
    }

    @Override
    public Stream<CompanionDiagnosticDevice> search(String query) {
        QueryBuilder queryBuilder = QueryBuilders
            .boolQuery()
            .should(new WildcardQueryBuilder("name", query + "*"))
            .should(new WildcardQueryBuilder("manufacturer", query + "*"));
        NativeSearchQuery nativeSearchQuery = new NativeSearchQueryBuilder().withQuery(queryBuilder).build();
        return elasticsearchTemplate.search(nativeSearchQuery, CompanionDiagnosticDevice.class).map(SearchHit::getContent).stream();
    }
}
